import type { EditUserProfilePayload } from '@/types'
import { UserProfileModel } from '@/models'

export async function findByUserId(userId: string) {
  return UserProfileModel.findOne({ userId, removed: false }).exec()
}

export async function findByUserIds(userIds: string[]) {
  return UserProfileModel.find({ userId: { $in: userIds }, removed: false }).exec()
}

export async function list(filters: { userId?: string, userIds?: string[] }) {
  const query: Record<string, unknown> = { removed: false }
  if (filters.userId !== undefined)
    query.userId = filters.userId
  if (filters.userIds !== undefined && filters.userIds.length > 0)
    query.userId = { $in: filters.userIds }
  return UserProfileModel.find(query).exec()
}

export async function createDefault(userId: string) {
  return UserProfileModel.create({
    userId,
    hiredAt: new Date(),
    defaultSchedule: null,
    utcOffset: '+03:00',
    salary: {
      amountMinor: 0,
      mode: 'per_shift',
      minWorkedShiftsToAccrue: 0,
      periodAnchor: 'hiredAt',
    },
    earlyBonus: { enabled: false, amountMinor: 0, graceMinutes: 0 },
    latePenalty: { enabled: false, amountMinor: 0, graceMinutes: 0 },
  })
}

export async function upsertByUserId(userId: string, payload: Omit<EditUserProfilePayload, 'userId'>) {
  return UserProfileModel.findOneAndUpdate(
    { userId, removed: false },
    {
      $set: {
        hiredAt: payload.hiredAt ?? null,
        defaultSchedule: payload.defaultSchedule ?? null,
        utcOffset: payload.utcOffset ?? '+03:00',
        salary: payload.salary,
        earlyBonus: payload.earlyBonus,
        latePenalty: payload.latePenalty,
      },
      $setOnInsert: { userId },
    },
    { new: true, upsert: true, runValidators: true },
  ).exec()
}
