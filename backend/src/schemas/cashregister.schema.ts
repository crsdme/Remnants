import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getCashregistersSchema = z.object({
  filters: z.object({
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

export const createCashregisterSchema = z.object({
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  accounts: z.array(idSchema).optional().default([]),
  active: z.boolean().optional().default(true),
})

export const editCashregisterSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  accounts: z.array(idSchema).optional().default([]),
  active: z.boolean().optional().default(true),
})

export const removeCashregistersSchema = z.object({
  ids: z.array(idSchema).min(1),
})
