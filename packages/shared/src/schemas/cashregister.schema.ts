import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'

export const cashregisterSchemaPopulatedDTO = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: numberFromStringSchema,
  accounts: z.array(z.object({
    id: idSchema,
    seq: numberFromStringSchema,
    names: languageStringSchema,
    currencies: z.array(z.object({
      id: idSchema,
      names: languageStringSchema,
      symbols: languageStringSchema,
      balance: numberFromStringSchema,
    })),
    priority: numberFromStringSchema,
    active: z.boolean().optional().default(true),
  })),
  active: z.boolean().optional().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const cashregisterSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: numberFromStringSchema,
  accounts: z.array(idSchema),
  active: z.boolean().optional().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CashregisterPopulatedDTO = z.output<typeof cashregisterSchemaPopulatedDTO>
export type CashregisterDTO = z.output<typeof cashregisterSchema>

export const getCashregistersSchema = z.object({
  filters: z.object({
    names: z.string().trim().optional(),
    language: z.string().default('en'),
    active: booleanArraySchema.optional(),
    priority: numberFromStringSchema.optional(),
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

export type GetCashregistersRequest = z.input<typeof getCashregistersSchema>

export const createCashregisterSchema = z.object({
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  accounts: z.array(idSchema).optional().default([]),
  active: z.boolean().optional().default(true),
})

export type CreateCashregisterRequest = z.input<typeof createCashregisterSchema>

export const editCashregisterSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  accounts: z.array(idSchema).optional().default([]),
  active: z.boolean().optional().default(true),
})

export type EditCashregisterRequest = z.input<typeof editCashregisterSchema>

export const removeCashregistersSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveCashregistersRequest = z.input<typeof removeCashregistersSchema>

export const getCashregistersResponseSchema = responseListSchema(cashregisterSchemaPopulatedDTO)
export type GetCashregistersResponse = z.output<typeof getCashregistersResponseSchema>

export const createCashregisterResponseSchema = responseItemSchema(cashregisterSchema)
export type CreateCashregisterResponse = z.output<typeof createCashregisterResponseSchema>

export const editCashregisterResponseSchema = responseItemSchema(cashregisterSchema)
export type EditCashregisterResponse = z.output<typeof editCashregisterResponseSchema>

export const removeCashregistersResponseSchema = responseSchema
export type RemoveCashregistersResponse = z.output<typeof removeCashregistersResponseSchema>
