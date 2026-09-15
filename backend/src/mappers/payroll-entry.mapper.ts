import type { PayrollEntryDTO } from '@remnant/shared'
import type { PayrollEntryDB } from '@/types'

export function mapPayrollEntryToDTO(entry: PayrollEntryDB | {
  _id: string
  userId: string
  type: PayrollEntryDTO['type']
  workDate: string
  minorAmount: number
  currencyId?: string
  workShiftId?: string
  periodStart?: string
  periodEnd?: string
  comment?: string
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}): PayrollEntryDTO {
  return {
    id: entry._id,
    userId: entry.userId,
    type: entry.type,
    workDate: entry.workDate,
    minorAmount: entry.minorAmount,
    currencyId: entry.currencyId,
    workShiftId: entry.workShiftId,
    periodStart: entry.periodStart,
    periodEnd: entry.periodEnd,
    comment: entry.comment ?? '',
    createdBy: entry.createdBy,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }
}
