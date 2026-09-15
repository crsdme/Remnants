import { z } from 'zod'
import {
  dateRangeSchema,
  idSchema,
  idSchemaOptional,
  languageStringSchema,
  minorSchema,
  paginationSchema,
  responseItemSchema,
  responseListSchema,
  responseSchema,
  sorterParamsSchema,
} from './common'
import { payrollTotalsSchema, userProfileSchema } from './user-profile.schema'
import { workDateSchema, workShiftSchema } from './work-shift.schema'

export const payrollEntryTypeSchema = z.enum([
  'salary',
  'early_bonus',
  'late_penalty',
  'adjustment',
])
export type PayrollEntryType = z.output<typeof payrollEntryTypeSchema>

export const payrollEntrySchema = z.object({
  id: idSchema,
  userId: idSchema,
  type: payrollEntryTypeSchema,
  workDate: workDateSchema,
  minorAmount: z.number(),
  currencyId: idSchemaOptional,
  workShiftId: idSchemaOptional,
  periodStart: workDateSchema.optional(),
  periodEnd: workDateSchema.optional(),
  comment: z.string().optional().default(''),
  createdBy: idSchemaOptional,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type PayrollEntryDTO = z.output<typeof payrollEntrySchema>

export const getPayrollEntriesSchema = z.object({
  filters: z.object({
    userId: idSchemaOptional,
    userIds: z.array(idSchema).optional(),
    type: z.array(payrollEntryTypeSchema).optional(),
    workDate: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    workDate: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})
export type GetPayrollEntriesRequest = z.input<typeof getPayrollEntriesSchema>

export const createPayrollEntrySchema = z.object({
  userId: idSchema,
  workDate: workDateSchema,
  minorAmount: minorSchema,
  currencyId: idSchemaOptional,
  comment: z.string().optional().default(''),
})
export type CreatePayrollEntryRequest = z.input<typeof createPayrollEntrySchema>

export const removePayrollEntriesSchema = z.object({
  ids: z.array(idSchema).min(1),
})
export type RemovePayrollEntriesRequest = z.input<typeof removePayrollEntriesSchema>

export const userProfileSummarySchema = z.object({
  user: z.object({
    id: idSchema,
    name: z.string(),
    login: z.string(),
    role: z.object({
      id: idSchema,
      names: languageStringSchema,
    }).optional(),
  }),
  profile: userProfileSchema,
  shifts: z.array(workShiftSchema),
  entries: z.array(payrollEntrySchema),
  totals: payrollTotalsSchema,
  activeShift: workShiftSchema.nullable(),
})
export type UserProfileSummaryDTO = z.output<typeof userProfileSummarySchema>

export const getUserProfileSummaryResponseSchema = responseItemSchema(userProfileSummarySchema)
export type GetUserProfileSummaryResponse = z.output<typeof getUserProfileSummaryResponseSchema>

export const getPayrollEntriesResponseSchema = responseListSchema(payrollEntrySchema)
export type GetPayrollEntriesResponse = z.output<typeof getPayrollEntriesResponseSchema>

export const createPayrollEntryResponseSchema = responseItemSchema(payrollEntrySchema)
export type CreatePayrollEntryResponse = z.output<typeof createPayrollEntryResponseSchema>

export const removePayrollEntriesResponseSchema = responseSchema
export type RemovePayrollEntriesResponse = z.output<typeof removePayrollEntriesResponseSchema>
