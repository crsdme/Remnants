import type {
  EditWorkShiftResponse,
  FinishWorkShiftResponse,
  PlanWorkShiftResponse,
  StartWorkShiftResponse,
  UnplanWorkShiftResponse,
  UserProfileDTO,
  WorkShiftStatus,
} from '@remnant/shared'
import type {
  EditWorkShiftPayload,
  FinishWorkShiftPayload,
  PlanWorkShiftPayload,
  StartWorkShiftPayload,
  UnplanWorkShiftPayload,
} from '@/types'
import { mapUserProfileToDTO, mapWorkShiftToDTO } from '@/mappers'
import * as PayrollEntryRepo from '@/repositories/payroll-entry.repo'
import * as WorkShiftRepo from '@/repositories/work-shift.repo'
import { HttpError } from '@/utils/'
import {
  addDaysToWorkDate,
  computeEarlyLate,
  formatWorkDate,
  resolveCalendarPeriod,
} from './payroll.utils'
import { ensureProfile } from './user-profile.service'

function hasPermission(permissions: string[] | undefined, permission: string) {
  if (!permissions)
    return false
  return permissions.includes(permission) || permissions.includes('other.admin')
}

function assertCanStartFor(actor: { id: string, permissions?: string[] }, targetUserId: string) {
  if (actor.id === targetUserId && hasPermission(actor.permissions, 'workShift.start'))
    return
  if (hasPermission(actor.permissions, 'workShift.edit'))
    return
  if (hasPermission(actor.permissions, 'other.admin'))
    return
  throw new HttpError(403, 'Access denied', 'PERMISSION_DENIED')
}

function assertCanEditShift(actor: { id: string, permissions?: string[] }) {
  if (hasPermission(actor.permissions, 'workShift.edit') || hasPermission(actor.permissions, 'other.admin'))
    return
  throw new HttpError(403, 'Access denied', 'PERMISSION_DENIED')
}

async function getProfileDto(userId: string): Promise<UserProfileDTO> {
  const profile = await ensureProfile(userId)
  return mapUserProfileToDTO(profile)
}

async function syncShiftPayroll(params: {
  shiftId: string
  userId: string
  workDate: string
  profile: UserProfileDTO
  startedAt: Date | null | undefined
  status: WorkShiftStatus
  plannedSchedule: UserProfileDTO['defaultSchedule']
  actorId: string
}) {
  await PayrollEntryRepo.removeByWorkShiftAndTypes(params.shiftId, [
    'salary',
    'early_bonus',
    'late_penalty',
  ])

  if (params.status !== 'completed' || !params.startedAt) {
    return { earlyBonusMinor: 0, latePenaltyMinor: 0, salaryMinor: 0 }
  }

  const { earlyBonusMinor, latePenaltyMinor } = computeEarlyLate({
    profile: params.profile,
    startedAt: params.startedAt,
    workDate: params.workDate,
    plannedSchedule: params.plannedSchedule,
  })

  const currencyId = params.profile.salary.currencyId
  let salaryMinor = 0

  if (earlyBonusMinor > 0) {
    await PayrollEntryRepo.createOne({
      userId: params.userId,
      type: 'early_bonus',
      workDate: params.workDate,
      minorAmount: earlyBonusMinor,
      currencyId,
      workShiftId: params.shiftId,
      createdBy: params.actorId,
    })
  }

  if (latePenaltyMinor > 0) {
    await PayrollEntryRepo.createOne({
      userId: params.userId,
      type: 'late_penalty',
      workDate: params.workDate,
      minorAmount: latePenaltyMinor,
      currencyId,
      workShiftId: params.shiftId,
      createdBy: params.actorId,
    })
  }

  if (params.profile.salary.mode === 'per_shift') {
    salaryMinor = Number(params.profile.salary.amountMinor) || 0
    if (salaryMinor > 0) {
      await PayrollEntryRepo.createOne({
        userId: params.userId,
        type: 'salary',
        workDate: params.workDate,
        minorAmount: salaryMinor,
        currencyId,
        workShiftId: params.shiftId,
        createdBy: params.actorId,
      })
    }
  }
  else if (params.profile.salary.mode === 'calendar_period') {
    await maybeAccrueCalendarPeriod({
      profile: params.profile,
      userId: params.userId,
      workDate: params.workDate,
      actorId: params.actorId,
    })
  }
  else if (params.profile.salary.mode === 'worked_shifts_period') {
    await maybeAccrueWorkedShiftsPeriod({
      profile: params.profile,
      userId: params.userId,
      workDate: params.workDate,
      actorId: params.actorId,
      shiftId: params.shiftId,
    })
  }

  return { earlyBonusMinor, latePenaltyMinor, salaryMinor }
}

async function tryAccrueOneCalendarPeriod(params: {
  profile: UserProfileDTO
  userId: string
  actorId: string
  periodStart: string
  periodEnd: string
  workDate: string
}) {
  if (params.workDate < params.periodEnd)
    return

  const existing = await PayrollEntryRepo.findPeriodSalary(
    params.userId,
    params.periodStart,
    params.periodEnd,
  )
  if (existing)
    return

  const completed = await WorkShiftRepo.countCompletedInRange(
    params.userId,
    params.periodStart,
    params.periodEnd,
  )
  const minRequired = params.profile.salary.minWorkedShiftsToAccrue ?? 0
  if (completed < minRequired)
    return

  const amount = Number(params.profile.salary.amountMinor) || 0
  if (amount <= 0)
    return

  await PayrollEntryRepo.createOne({
    userId: params.userId,
    type: 'salary',
    workDate: params.periodEnd,
    minorAmount: amount,
    currencyId: params.profile.salary.currencyId,
    periodStart: params.periodStart,
    periodEnd: params.periodEnd,
    createdBy: params.actorId,
    comment: `Calendar period ${params.periodStart} – ${params.periodEnd}`,
  })
}

async function maybeAccrueCalendarPeriod(params: {
  profile: UserProfileDTO
  userId: string
  workDate: string
  actorId: string
}) {
  const periodDays = params.profile.salary.periodDays
  if (!periodDays)
    return

  const anchor = params.profile.salary.periodAnchor ?? 'hiredAt'
  const current = resolveCalendarPeriod({
    workDate: params.workDate,
    periodDays,
    anchor,
    hiredAt: params.profile.hiredAt,
    utcOffset: params.profile.utcOffset,
  })
  if (!current)
    return

  await tryAccrueOneCalendarPeriod({
    profile: params.profile,
    userId: params.userId,
    actorId: params.actorId,
    periodStart: current.periodStart,
    periodEnd: current.periodEnd,
    workDate: params.workDate,
  })

  // Also close the previous window if this finish happens after it ended
  // (e.g. no shift on the last day of the period).
  const prevEnd = addDaysToWorkDate(current.periodStart, -1)
  const previous = resolveCalendarPeriod({
    workDate: prevEnd,
    periodDays,
    anchor,
    hiredAt: params.profile.hiredAt,
    utcOffset: params.profile.utcOffset,
  })
  if (!previous)
    return

  await tryAccrueOneCalendarPeriod({
    profile: params.profile,
    userId: params.userId,
    actorId: params.actorId,
    periodStart: previous.periodStart,
    periodEnd: previous.periodEnd,
    workDate: params.workDate,
  })
}

async function maybeAccrueWorkedShiftsPeriod(params: {
  profile: UserProfileDTO
  userId: string
  workDate: string
  actorId: string
  shiftId: string
}) {
  const periodShifts = params.profile.salary.periodShifts
  if (!periodShifts || periodShifts < 1)
    return

  // Find last period salary entry to know where counter starts
  const allCompleted = await WorkShiftRepo.listCompletedAfter(params.userId, null)
  const count = allCompleted.length
  if (count === 0 || count % periodShifts !== 0)
    return

  const chunk = allCompleted.slice(-periodShifts)
  const periodStart = chunk[0]?.workDate
  const periodEnd = chunk[chunk.length - 1]?.workDate
  if (!periodStart || !periodEnd)
    return

  const existing = await PayrollEntryRepo.findPeriodSalary(params.userId, periodStart, periodEnd)
  if (existing)
    return

  const amount = Number(params.profile.salary.amountMinor) || 0
  if (amount <= 0)
    return

  await PayrollEntryRepo.createOne({
    userId: params.userId,
    type: 'salary',
    workDate: params.workDate,
    minorAmount: amount,
    currencyId: params.profile.salary.currencyId,
    workShiftId: params.shiftId,
    periodStart,
    periodEnd,
    createdBy: params.actorId,
    comment: `Worked shifts period ${periodStart} – ${periodEnd}`,
  })
}

export async function start({
  payload,
  user,
}: {
  payload: StartWorkShiftPayload
  user: { id: string, permissions?: string[] }
}): Promise<StartWorkShiftResponse> {
  const targetUserId = payload.userId ?? user.id
  assertCanStartFor(user, targetUserId)

  const profile = await getProfileDto(targetUserId)
  const startedAt = payload.startedAt ? new Date(payload.startedAt) : new Date()
  const workDate = payload.workDate ?? formatWorkDate(startedAt, profile.utcOffset)

  const active = await WorkShiftRepo.findActiveByUser(targetUserId)
  if (active && active.workDate !== workDate)
    throw new HttpError(400, 'Another shift is already started', 'SHIFT_ALREADY_STARTED')

  const existing = await WorkShiftRepo.findByUserAndDate(targetUserId, workDate)
  if (existing) {
    if (existing.status === 'started') {
      return {
        status: 'success',
        code: 'WORK_SHIFT_STARTED',
        message: 'Work shift already started',
        data: mapWorkShiftToDTO(existing),
      }
    }
    if (existing.status === 'completed')
      throw new HttpError(400, 'Shift already completed for this day', 'SHIFT_ALREADY_COMPLETED')
  }

  const plannedSchedule = existing?.plannedSchedule ?? profile.defaultSchedule ?? null

  const shift = existing
    ? await WorkShiftRepo.updateById(existing._id, {
        status: 'started',
        startedAt,
        finishedAt: null,
        plannedSchedule,
        markedByUserId: user.id,
        earlyBonusMinor: 0,
        latePenaltyMinor: 0,
        salaryMinor: 0,
      })
    : await WorkShiftRepo.createOne({
        userId: targetUserId,
        workDate,
        status: 'started',
        startedAt,
        finishedAt: null,
        plannedSchedule,
        markedByUserId: user.id,
        earlyBonusMinor: 0,
        latePenaltyMinor: 0,
        salaryMinor: 0,
      })

  if (!shift)
    throw new HttpError(500, 'Failed to start shift', 'SHIFT_START_FAILED')

  return {
    status: 'success',
    code: 'WORK_SHIFT_STARTED',
    message: 'Work shift started',
    data: mapWorkShiftToDTO(shift),
  }
}

export async function finish({
  payload,
  user,
}: {
  payload: FinishWorkShiftPayload
  user: { id: string, permissions?: string[] }
}): Promise<FinishWorkShiftResponse> {
  let shift = payload.id
    ? await WorkShiftRepo.findById(payload.id)
    : null

  if (!shift) {
    const targetUserId = payload.userId ?? user.id
    const profile = await getProfileDto(targetUserId)
    const workDate = payload.workDate
      ?? formatWorkDate(payload.finishedAt ? new Date(payload.finishedAt) : new Date(), profile.utcOffset)
    shift = await WorkShiftRepo.findByUserAndDate(targetUserId, workDate)
  }

  if (!shift)
    throw new HttpError(404, 'Shift not found', 'SHIFT_NOT_FOUND')

  assertCanStartFor(user, shift.userId)

  if (shift.status === 'completed') {
    return {
      status: 'success',
      code: 'WORK_SHIFT_FINISHED',
      message: 'Work shift already finished',
      data: mapWorkShiftToDTO(shift),
    }
  }

  if (shift.status !== 'started')
    throw new HttpError(400, 'Shift is not started', 'SHIFT_NOT_STARTED')

  const finishedAt = payload.finishedAt ? new Date(payload.finishedAt) : new Date()
  const profile = await getProfileDto(shift.userId)

  const payroll = await syncShiftPayroll({
    shiftId: shift._id,
    userId: shift.userId,
    workDate: shift.workDate,
    profile,
    startedAt: shift.startedAt,
    status: 'completed',
    plannedSchedule: shift.plannedSchedule ?? profile.defaultSchedule,
    actorId: user.id,
  })

  const updated = await WorkShiftRepo.updateById(shift._id, {
    status: 'completed',
    finishedAt,
    markedByUserId: user.id,
    earlyBonusMinor: payroll.earlyBonusMinor,
    latePenaltyMinor: payroll.latePenaltyMinor,
    salaryMinor: payroll.salaryMinor,
  })

  if (!updated)
    throw new HttpError(500, 'Failed to finish shift', 'SHIFT_FINISH_FAILED')

  return {
    status: 'success',
    code: 'WORK_SHIFT_FINISHED',
    message: 'Work shift finished',
    data: mapWorkShiftToDTO(updated),
  }
}

export async function edit({
  payload,
  user,
}: {
  payload: EditWorkShiftPayload
  user: { id: string, permissions?: string[] }
}): Promise<EditWorkShiftResponse> {
  assertCanEditShift(user)

  const shift = await WorkShiftRepo.findById(payload.id)
  if (!shift)
    throw new HttpError(404, 'Shift not found', 'SHIFT_NOT_FOUND')

  const profile = await getProfileDto(shift.userId)
  const startedAt = payload.startedAt !== undefined ? payload.startedAt : shift.startedAt
  const finishedAt = payload.finishedAt !== undefined ? payload.finishedAt : shift.finishedAt
  const status = payload.status ?? shift.status
  const plannedSchedule = payload.plannedSchedule !== undefined
    ? payload.plannedSchedule
    : shift.plannedSchedule

  const payroll = await syncShiftPayroll({
    shiftId: shift._id,
    userId: shift.userId,
    workDate: shift.workDate,
    profile,
    startedAt: startedAt ?? null,
    status,
    plannedSchedule,
    actorId: user.id,
  })

  const updated = await WorkShiftRepo.updateById(shift._id, {
    startedAt: startedAt ?? null,
    finishedAt: finishedAt ?? null,
    status,
    plannedSchedule: plannedSchedule ?? null,
    markedByUserId: user.id,
    earlyBonusMinor: payroll.earlyBonusMinor,
    latePenaltyMinor: payroll.latePenaltyMinor,
    salaryMinor: payroll.salaryMinor,
  })

  if (!updated)
    throw new HttpError(500, 'Failed to edit shift', 'SHIFT_EDIT_FAILED')

  return {
    status: 'success',
    code: 'WORK_SHIFT_UPDATED',
    message: 'Work shift updated',
    data: mapWorkShiftToDTO(updated),
  }
}

export async function plan({
  payload,
  user,
}: {
  payload: PlanWorkShiftPayload
  user: { id: string, permissions?: string[] }
}): Promise<PlanWorkShiftResponse> {
  assertCanEditShift(user)

  const profile = await getProfileDto(payload.userId)
  const plannedSchedule = payload.plannedSchedule !== undefined
    ? payload.plannedSchedule
    : (profile.defaultSchedule ?? null)

  const existing = await WorkShiftRepo.findByUserAndDate(payload.userId, payload.workDate)
  if (existing) {
    if (existing.status === 'started' || existing.status === 'completed')
      throw new HttpError(400, 'Cannot plan over an active or completed shift', 'SHIFT_ALREADY_EXISTS')

    const updated = await WorkShiftRepo.updateById(existing._id, {
      status: 'planned',
      startedAt: null,
      finishedAt: null,
      plannedSchedule,
      markedByUserId: user.id,
      earlyBonusMinor: 0,
      latePenaltyMinor: 0,
      salaryMinor: 0,
    })
    if (!updated)
      throw new HttpError(500, 'Failed to plan shift', 'SHIFT_PLAN_FAILED')

    return {
      status: 'success',
      code: 'WORK_SHIFT_PLANNED',
      message: 'Work day planned',
      data: mapWorkShiftToDTO(updated),
    }
  }

  const created = await WorkShiftRepo.createOne({
    userId: payload.userId,
    workDate: payload.workDate,
    status: 'planned',
    startedAt: null,
    finishedAt: null,
    plannedSchedule,
    markedByUserId: user.id,
    earlyBonusMinor: 0,
    latePenaltyMinor: 0,
    salaryMinor: 0,
  })

  return {
    status: 'success',
    code: 'WORK_SHIFT_PLANNED',
    message: 'Work day planned',
    data: mapWorkShiftToDTO(created),
  }
}

export async function unplan({
  payload,
  user,
}: {
  payload: UnplanWorkShiftPayload
  user: { id: string, permissions?: string[] }
}): Promise<UnplanWorkShiftResponse> {
  assertCanEditShift(user)

  let shift = payload.id
    ? await WorkShiftRepo.findById(payload.id)
    : null

  if (!shift && payload.userId && payload.workDate)
    shift = await WorkShiftRepo.findByUserAndDate(payload.userId, payload.workDate)

  if (!shift)
    throw new HttpError(404, 'Shift not found', 'SHIFT_NOT_FOUND')

  if (shift.status !== 'planned')
    throw new HttpError(400, 'Only planned days can be removed', 'SHIFT_NOT_PLANNED')

  const removed = await WorkShiftRepo.softRemoveById(shift._id)
  if (!removed)
    throw new HttpError(500, 'Failed to unplan shift', 'SHIFT_UNPLAN_FAILED')

  return {
    status: 'success',
    code: 'WORK_SHIFT_UNPLANNED',
    message: 'Planned work day removed',
    data: mapWorkShiftToDTO(removed),
  }
}
