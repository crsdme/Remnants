import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getCashregisterAccountsSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    active: booleanArraySchema.optional(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export const createCashregisterAccountSchema = z.object({
  names: languageStringSchema,
  currencies: z.array(idSchema).min(1, { message: 'Currency is required' }),
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
})

export const editCashregisterAccountSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  currencies: z.array(idSchema).min(1, { message: 'Currency is required' }),
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
})

export const removeCashregisterAccountsSchema = z.object({
  ids: z.array(idSchema).min(1),
})
