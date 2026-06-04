import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

export const getCashregisterAccountsSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).default([]),
    names: z.string().trim().optional(),
    language: z.string().default('en'),
    active: booleanArraySchema.optional(),
    priority: numberFromStringSchema.optional(),
    cashregister: z.array(idSchema).default([]),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional(),
  pagination: paginationSchema.optional().default({}),
})

export type GetCashregisterAccountsRequest = z.input<typeof getCashregisterAccountsSchema>

export const createCashregisterAccountSchema = z.object({
  names: languageStringSchema,
  currencies: z.array(idSchema).min(1, { message: 'Currency is required' }),
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
})

export type CreateCashregisterAccountRequest = z.input<typeof createCashregisterAccountSchema>

export const editCashregisterAccountSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  currencies: z.array(idSchema).min(1, { message: 'Currency is required' }),
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
})

export type EditCashregisterAccountRequest = z.input<typeof editCashregisterAccountSchema>

export const removeCashregisterAccountsSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveCashregisterAccountsRequest = z.input<typeof removeCashregisterAccountsSchema>
