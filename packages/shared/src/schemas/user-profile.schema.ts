import { z } from 'zod'
import {
  idSchema,
  idSchemaOptional,
  minorSchema,
  numberFromStringSchema,
  responseItemSchema,
  responseListSchema,
  responseSchema,
} from './common'

export const salaryModeSchema = z.enum([
  'per_shift',
  'calendar_period',
  'worked_shifts_period',
])
export type SalaryMode = z.output<typeof salaryModeSchema>

export const salaryPeriodAnchorSchema = z.enum(['hiredAt', 'monthStart'])
export type SalaryPeriodAnchor = z.output<typeof salaryPeriodAnchorSchema>

const timeHHmmSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:mm')

export const workScheduleSchema = z.object({
  start: timeHHmmSchema,
  end: timeHHmmSchema,
})
export type WorkSchedule = z.output<typeof workScheduleSchema>

export const salarySettingsSchema = z.object({
  amountMinor: minorSchema.catch(0 as never),
  currencyId: idSchemaOptional,
  mode: salaryModeSchema.default('per_shift'),
  periodDays: z.number().int().min(1).max(366).optional(),
  periodShifts: z.number().int().min(1).max(366).optional(),
  minWorkedShiftsToAccrue: z.number().int().min(0).max(366).optional().default(0),
  periodAnchor: salaryPeriodAnchorSchema.optional().default('hiredAt'),
})
export type SalarySettings = z.output<typeof salarySettingsSchema>

export const bonusRuleSchema = z.object({
  enabled: z.boolean().default(false),
  amountMinor: minorSchema.catch(0 as never),
  graceMinutes: z.number().int().min(0).max(24 * 60).optional().default(0),
})
export type BonusRule = z.output<typeof bonusRuleSchema>

export const userProfileSchema = z.object({
  id: idSchema,
  userId: idSchema,
  hiredAt: z.coerce.date().nullable().optional(),
  defaultSchedule: workScheduleSchema.nullable().optional(),
  utcOffset: z.string().regex(/^[+-]\d{2}:\d{2}$/).default('+03:00'),
  salary: salarySettingsSchema,
  earlyBonus: bonusRuleSchema,
  latePenalty: bonusRuleSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type UserProfileDTO = z.output<typeof userProfileSchema>

export const getUserProfilesSchema = z.object({
  filters: z.object({
    userId: idSchemaOptional,
    userIds: z.array(idSchema).optional(),
  }).optional().default({}),
})
export type GetUserProfilesRequest = z.input<typeof getUserProfilesSchema>

export const getUserProfileSchema = z.object({
  userId: idSchema,
})
export type GetUserProfileRequest = z.input<typeof getUserProfileSchema>

export const editUserProfileSchema = z.object({
  userId: idSchema,
  hiredAt: z.coerce.date().nullable().optional(),
  defaultSchedule: workScheduleSchema.nullable().optional(),
  utcOffset: z.string().regex(/^[+-]\d{2}:\d{2}$/).optional(),
  salary: salarySettingsSchema,
  earlyBonus: bonusRuleSchema,
  latePenalty: bonusRuleSchema,
})
export type EditUserProfileRequest = z.input<typeof editUserProfileSchema>

export const getUserProfileSummarySchema = z.object({
  userId: idSchema,
  year: numberFromStringSchema,
  month: numberFromStringSchema, // 1-12
})
export type GetUserProfileSummaryRequest = z.input<typeof getUserProfileSummarySchema>

export const payrollTotalsSchema = z.object({
  salaryMinor: z.number(),
  earlyBonusMinor: z.number(),
  latePenaltyMinor: z.number(),
  adjustmentMinor: z.number(),
  totalMinor: z.number(),
  currencyId: idSchemaOptional,
})
export type PayrollTotals = z.output<typeof payrollTotalsSchema>

export const getUserProfilesResponseSchema = responseListSchema(userProfileSchema)
export type GetUserProfilesResponse = z.output<typeof getUserProfilesResponseSchema>

export const getUserProfileResponseSchema = responseItemSchema(userProfileSchema)
export type GetUserProfileResponse = z.output<typeof getUserProfileResponseSchema>

export const editUserProfileResponseSchema = responseItemSchema(userProfileSchema)
export type EditUserProfileResponse = z.output<typeof editUserProfileResponseSchema>

export const removeUserProfilesResponseSchema = responseSchema
