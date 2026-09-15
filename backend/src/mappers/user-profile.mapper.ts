import type { UserProfileDTO } from '@remnant/shared'
import type { UserProfileDB } from '@/types'

export function mapUserProfileToDTO(profile: UserProfileDB | {
  _id: string
  userId: string
  hiredAt?: Date | null
  defaultSchedule?: UserProfileDTO['defaultSchedule']
  utcOffset?: string
  salary: UserProfileDTO['salary']
  earlyBonus: UserProfileDTO['earlyBonus']
  latePenalty: UserProfileDTO['latePenalty']
  createdAt: Date
  updatedAt: Date
}): UserProfileDTO {
  return {
    id: profile._id,
    userId: profile.userId,
    hiredAt: profile.hiredAt ?? null,
    defaultSchedule: profile.defaultSchedule ?? null,
    utcOffset: profile.utcOffset ?? '+03:00',
    salary: {
      amountMinor: profile.salary?.amountMinor ?? 0,
      currencyId: profile.salary?.currencyId ?? undefined,
      mode: profile.salary?.mode ?? 'per_shift',
      periodDays: profile.salary?.periodDays,
      periodShifts: profile.salary?.periodShifts,
      minWorkedShiftsToAccrue: profile.salary?.minWorkedShiftsToAccrue ?? 0,
      periodAnchor: profile.salary?.periodAnchor ?? 'hiredAt',
    },
    earlyBonus: {
      enabled: profile.earlyBonus?.enabled ?? false,
      amountMinor: profile.earlyBonus?.amountMinor ?? 0,
      graceMinutes: profile.earlyBonus?.graceMinutes ?? 0,
    },
    latePenalty: {
      enabled: profile.latePenalty?.enabled ?? false,
      amountMinor: profile.latePenalty?.amountMinor ?? 0,
      graceMinutes: profile.latePenalty?.graceMinutes ?? 0,
    },
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  }
}
