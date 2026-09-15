import type {
  EditUserProfileResponse,
  GetUserProfileResponse,
  GetUserProfilesResponse,
  GetUserProfileSummaryResponse,
} from '@remnant/shared'
import type {
  EditUserProfilePayload,
  GetUserProfilePayload,
  GetUserProfilesPayload,
  GetUserProfileSummaryPayload,
} from '@/types'
import { mapPayrollEntryToDTO, mapUserProfileToDTO, mapWorkShiftToDTO } from '@/mappers'
import * as PayrollEntryRepo from '@/repositories/payroll-entry.repo'
import * as UserProfileRepo from '@/repositories/user-profile.repo'
import * as WorkShiftRepo from '@/repositories/work-shift.repo'
import * as UsersRepo from '@/repositories/users.repo'
import { HttpError } from '@/utils/'
import { monthRange } from './payroll.utils'

function hasPermission(permissions: string[] | undefined, permission: string) {
  if (!permissions)
    return false
  return permissions.includes(permission) || permissions.includes('other.admin')
}

export function assertCanReadProfile(actor: { id: string, permissions?: string[] }, targetUserId: string) {
  if (actor.id === targetUserId)
    return
  if (hasPermission(actor.permissions, 'userProfile.edit') || hasPermission(actor.permissions, 'userProfile.readAll'))
    return
  throw new HttpError(403, 'Access denied', 'PERMISSION_DENIED')
}

export function assertCanEditProfile(actor: { id: string, permissions?: string[] }) {
  if (hasPermission(actor.permissions, 'userProfile.edit') || hasPermission(actor.permissions, 'other.admin'))
    return
  throw new HttpError(403, 'Access denied', 'PERMISSION_DENIED')
}

export async function ensureProfile(userId: string) {
  const existing = await UserProfileRepo.findByUserId(userId)
  if (existing)
    return existing
  return UserProfileRepo.createDefault(userId)
}

export async function get({
  payload,
}: {
  payload: GetUserProfilesPayload
}): Promise<GetUserProfilesResponse> {
  const items = await UserProfileRepo.list(payload.filters ?? {})
  return {
    status: 'success',
    code: 'USER_PROFILES_FETCHED',
    message: 'User profiles fetched',
    data: {
      items: items.map(mapUserProfileToDTO),
      pagination: {
        total: items.length,
        page: 1,
        pageSize: items.length || 1,
      },
    },
  }
}

export async function getOne({
  payload,
  user,
}: {
  payload: GetUserProfilePayload
  user: { id: string, permissions?: string[] }
}): Promise<GetUserProfileResponse> {
  assertCanReadProfile(user, payload.userId)
  const profile = await ensureProfile(payload.userId)
  return {
    status: 'success',
    code: 'USER_PROFILE_FETCHED',
    message: 'User profile fetched',
    data: mapUserProfileToDTO(profile),
  }
}

export async function edit({
  payload,
  user,
}: {
  payload: EditUserProfilePayload
  user: { id: string, permissions?: string[] }
}): Promise<EditUserProfileResponse> {
  assertCanEditProfile(user)

  const target = await UsersRepo.findById(payload.userId)
  if (!target)
    throw new HttpError(404, 'User not found', 'USER_NOT_FOUND')

  const profile = await UserProfileRepo.upsertByUserId(payload.userId, payload)
  if (!profile)
    throw new HttpError(500, 'Failed to save profile', 'PROFILE_SAVE_FAILED')

  return {
    status: 'success',
    code: 'USER_PROFILE_UPDATED',
    message: 'User profile updated',
    data: mapUserProfileToDTO(profile),
  }
}

export async function summary({
  payload,
  user,
}: {
  payload: GetUserProfileSummaryPayload
  user: { id: string, permissions?: string[] }
}): Promise<GetUserProfileSummaryResponse> {
  assertCanReadProfile(user, payload.userId)

  const targetUser = await UsersRepo.findById(payload.userId)
  if (!targetUser)
    throw new HttpError(404, 'User not found', 'USER_NOT_FOUND')

  const year = Number(payload.year)
  const month = Number(payload.month)
  if (!year || month < 1 || month > 12)
    throw new HttpError(400, 'Invalid year/month', 'INVALID_PERIOD')

  const profileDoc = await ensureProfile(payload.userId)
  const profile = mapUserProfileToDTO(profileDoc)
  const { from, to } = monthRange(year, month)

  const [shifts, entries, activeShift] = await Promise.all([
    WorkShiftRepo.listByUserAndDateRange(payload.userId, from, to),
    PayrollEntryRepo.listByUserAndDateRange(payload.userId, from, to),
    WorkShiftRepo.findActiveByUser(payload.userId),
  ])

  const mappedEntries = entries.map(mapPayrollEntryToDTO)
  let salaryMinor = 0
  let earlyBonusMinor = 0
  let latePenaltyMinor = 0
  let adjustmentMinor = 0

  for (const entry of mappedEntries) {
    const amount = entry.minorAmount
    switch (entry.type) {
      case 'salary':
        salaryMinor += amount
        break
      case 'early_bonus':
        earlyBonusMinor += amount
        break
      case 'late_penalty':
        latePenaltyMinor += amount
        break
      case 'adjustment':
        adjustmentMinor += amount
        break
    }
  }

  const role = targetUser.role as { _id?: string, id?: string, names?: Record<string, string> | Map<string, string> } | undefined
  const roleId = role?.id ?? role?._id
  const roleNames = role?.names instanceof Map
    ? Object.fromEntries(role.names.entries())
    : (role?.names ?? {})

  return {
    status: 'success',
    code: 'USER_PROFILE_SUMMARY_FETCHED',
    message: 'User profile summary fetched',
    data: {
      user: {
        id: targetUser._id,
        name: targetUser.name,
        login: targetUser.login,
        role: roleId
          ? {
              id: roleId,
              names: roleNames,
            }
          : undefined,
      },
      profile,
      shifts: shifts.map(mapWorkShiftToDTO),
      entries: mappedEntries,
      totals: {
        salaryMinor,
        earlyBonusMinor,
        latePenaltyMinor,
        adjustmentMinor,
        totalMinor: salaryMinor + earlyBonusMinor - latePenaltyMinor + adjustmentMinor,
        currencyId: profile.salary.currencyId,
      },
      activeShift: activeShift ? mapWorkShiftToDTO(activeShift) : null,
    },
  }
}
