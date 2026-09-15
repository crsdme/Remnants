import type { WorkShiftDTO } from '@remnant/shared'
import type { WorkShiftDB } from '@/types'

export function mapWorkShiftToDTO(shift: WorkShiftDB | {
  _id: string
  userId: string
  workDate: string
  status: WorkShiftDTO['status']
  startedAt?: Date | null
  finishedAt?: Date | null
  plannedSchedule?: WorkShiftDTO['plannedSchedule']
  earlyBonusMinor?: number
  latePenaltyMinor?: number
  salaryMinor?: number
  markedByUserId?: string
  createdAt: Date
  updatedAt: Date
}): WorkShiftDTO {
  return {
    id: shift._id,
    userId: shift.userId,
    workDate: shift.workDate,
    status: shift.status,
    startedAt: shift.startedAt ?? null,
    finishedAt: shift.finishedAt ?? null,
    plannedSchedule: shift.plannedSchedule ?? null,
    earlyBonusMinor: shift.earlyBonusMinor ?? 0,
    latePenaltyMinor: shift.latePenaltyMinor ?? 0,
    salaryMinor: shift.salaryMinor ?? 0,
    markedByUserId: shift.markedByUserId,
    createdAt: shift.createdAt,
    updatedAt: shift.updatedAt,
  }
}
