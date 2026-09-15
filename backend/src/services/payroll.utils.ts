import type { UserProfileDTO, WorkSchedule } from '@remnant/shared'

export function formatWorkDate(date: Date, utcOffset = '+03:00'): string {
  const offsetMs = parseUtcOffsetToMs(utcOffset)
  const local = new Date(date.getTime() + offsetMs)
  const y = local.getUTCFullYear()
  const m = String(local.getUTCMonth() + 1).padStart(2, '0')
  const d = String(local.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseUtcOffsetToMs(offset: string): number {
  const match = /^([+-])(\d{2}):(\d{2})$/.exec(offset)
  if (!match)
    return 3 * 60 * 60 * 1000
  const sign = match[1] === '-' ? -1 : 1
  const hours = Number(match[2])
  const minutes = Number(match[3])
  return sign * (hours * 60 + minutes) * 60 * 1000
}

export function plannedDateTime(workDate: string, timeHHmm: string, utcOffset: string): Date {
  return new Date(`${workDate}T${timeHHmm}:00${utcOffset}`)
}

export function addDaysToWorkDate(workDate: string, days: number): string {
  const [y, m, d] = workDate.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCDate(date.getUTCDate() + days)
  const yy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

export function monthRange(year: number, month: number): { from: string, to: string } {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { from, to }
}

export function computeEarlyLate(params: {
  profile: UserProfileDTO
  startedAt: Date
  workDate: string
  plannedSchedule: WorkSchedule | null | undefined
}): { earlyBonusMinor: number, latePenaltyMinor: number } {
  const schedule = params.plannedSchedule ?? params.profile.defaultSchedule ?? null
  if (!schedule)
    return { earlyBonusMinor: 0, latePenaltyMinor: 0 }

  const plannedStart = plannedDateTime(params.workDate, schedule.start, params.profile.utcOffset)
  const startedAt = params.startedAt.getTime()
  const plannedStartMs = plannedStart.getTime()

  let earlyBonusMinor = 0
  let latePenaltyMinor = 0

  if (params.profile.earlyBonus.enabled && startedAt < plannedStartMs) {
    earlyBonusMinor = Number(params.profile.earlyBonus.amountMinor) || 0
  }

  if (params.profile.latePenalty.enabled) {
    const graceMs = (params.profile.latePenalty.graceMinutes ?? 0) * 60 * 1000
    if (startedAt > plannedStartMs + graceMs)
      latePenaltyMinor = Number(params.profile.latePenalty.amountMinor) || 0
  }

  return { earlyBonusMinor, latePenaltyMinor }
}

/** Calendar period window containing workDate (inclusive start, inclusive end). */
export function resolveCalendarPeriod(params: {
  workDate: string
  periodDays: number
  anchor: 'hiredAt' | 'monthStart'
  hiredAt: Date | null | undefined
  utcOffset: string
}): { periodStart: string, periodEnd: string } | null {
  const periodDays = params.periodDays
  if (!periodDays || periodDays < 1)
    return null

  if (params.anchor === 'monthStart') {
    const [y, m] = params.workDate.split('-').map(Number)
    const { from, to } = monthRange(y, m)
    return { periodStart: from, periodEnd: to }
  }

  const hiredAt = params.hiredAt ?? new Date(`${params.workDate}T00:00:00${params.utcOffset}`)
  let cursor = formatWorkDate(hiredAt, params.utcOffset)

  // Walk forward in periodDays windows until workDate is inside
  // Cap iterations for safety
  for (let i = 0; i < 500; i++) {
    const periodEnd = addDaysToWorkDate(cursor, periodDays - 1)
    if (params.workDate >= cursor && params.workDate <= periodEnd)
      return { periodStart: cursor, periodEnd }

    if (params.workDate < cursor)
      return null

    cursor = addDaysToWorkDate(periodEnd, 1)
  }

  return null
}
