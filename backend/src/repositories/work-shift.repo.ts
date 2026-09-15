import type { WorkShiftDB } from '@/types'
import { WorkShiftModel } from '@/models'

export async function listByUserAndDateRange(userId: string, from: string, to: string) {
  return WorkShiftModel.find({
    userId,
    removed: false,
    workDate: { $gte: from, $lte: to },
  }).sort({ workDate: 1 }).exec()
}

export async function findByUserAndDate(userId: string, workDate: string) {
  return WorkShiftModel.findOne({ userId, workDate, removed: false }).exec()
}

export async function findById(id: string) {
  return WorkShiftModel.findOne({ _id: id, removed: false }).exec()
}

export async function findActiveByUser(userId: string) {
  return WorkShiftModel.findOne({ userId, status: 'started', removed: false }).exec()
}

export async function createOne(payload: Partial<WorkShiftDB> & { userId: string, workDate: string, status: WorkShiftDB['status'] }) {
  return WorkShiftModel.create(payload)
}

export async function updateById(id: string, payload: Record<string, unknown>) {
  return WorkShiftModel.findOneAndUpdate(
    { _id: id, removed: false },
    { $set: payload },
    { new: true, runValidators: true },
  ).exec()
}

export async function softRemoveById(id: string) {
  return WorkShiftModel.findOneAndUpdate(
    { _id: id, removed: false },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}

export async function countCompletedInRange(userId: string, from: string, to: string) {
  return WorkShiftModel.countDocuments({
    userId,
    removed: false,
    status: 'completed',
    workDate: { $gte: from, $lte: to },
  }).exec()
}

export async function listCompletedAfter(userId: string, afterDateExclusive: string | null) {
  const query: Record<string, unknown> = {
    userId,
    removed: false,
    status: 'completed',
  }
  if (afterDateExclusive)
    query.workDate = { $gt: afterDateExclusive }

  return WorkShiftModel.find(query).sort({ workDate: 1 }).exec()
}
