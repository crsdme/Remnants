import type { PayrollEntryDB } from '@/types'
import { PayrollEntryModel } from '@/models'

export async function listByUserAndDateRange(userId: string, from: string, to: string) {
  return PayrollEntryModel.find({
    userId,
    removed: false,
    workDate: { $gte: from, $lte: to },
  }).sort({ workDate: 1, createdAt: 1 }).exec()
}

export async function createOne(payload: Partial<PayrollEntryDB> & {
  userId: string
  type: PayrollEntryDB['type']
  workDate: string
  minorAmount: number
}) {
  return PayrollEntryModel.create(payload)
}

export async function removeByWorkShiftAndTypes(workShiftId: string, types: PayrollEntryDB['type'][]) {
  return PayrollEntryModel.updateMany(
    { workShiftId, type: { $in: types }, removed: false },
    { $set: { removed: true } },
  ).exec()
}

export async function findPeriodSalary(userId: string, periodStart: string, periodEnd: string) {
  return PayrollEntryModel.findOne({
    userId,
    type: 'salary',
    periodStart,
    periodEnd,
    removed: false,
  }).exec()
}

export async function removeByIds(ids: string[]) {
  return PayrollEntryModel.updateMany(
    { _id: { $in: ids }, removed: false },
    { $set: { removed: true } },
  ).exec()
}

export async function findById(id: string) {
  return PayrollEntryModel.findOne({ _id: id, removed: false }).exec()
}
