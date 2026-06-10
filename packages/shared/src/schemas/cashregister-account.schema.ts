import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'

export const cashregisterAccountSchemaPopulatedDTO = z.object({
  id: idSchema,
  seq: z.number(),
  names: languageStringSchema,
  currencies: z.array(z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
  })),
  priority: z.number(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const cashregisterAccountSchema = z.object({
  id: idSchema,
  seq: z.number(),
  names: languageStringSchema,
  currencies: z.array(idSchema),
  priority: z.number(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CashregisterAccountDTO = z.output<typeof cashregisterAccountSchema>

export type CashregisterAccountPopulatedDTO = z.output<typeof cashregisterAccountSchemaPopulatedDTO>

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

export const getCashregisterAccountsResponseSchema = responseListSchema(cashregisterAccountSchemaPopulatedDTO)
export type GetCashregisterAccountsResponse = z.output<typeof getCashregisterAccountsResponseSchema>

export const createCashregisterAccountResponseSchema = responseItemSchema(cashregisterAccountSchema)
export type CreateCashregisterAccountResponse = z.output<typeof createCashregisterAccountResponseSchema>

export const editCashregisterAccountResponseSchema = responseItemSchema(cashregisterAccountSchema)
export type EditCashregisterAccountResponse = z.output<typeof editCashregisterAccountResponseSchema>

export const removeCashregisterAccountsResponseSchema = responseSchema
export type RemoveCashregisterAccountsResponse = z.output<typeof removeCashregisterAccountsResponseSchema>
