import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

function hasIdsOrFilters(data: {
  ids?: unknown
  filters?: unknown
}) {
  return !!data.ids || !!data.filters
}

export const getCurrencySchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    names: z.string().trim().optional(),
    symbols: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    priority: numberFromStringSchema.optional(),
    cashregisterAccount: z.array(idSchema).optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    active: booleanArraySchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    symbols: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export const createCurrencySchema = z.object({
  names: languageStringSchema,
  symbols: languageStringSchema,
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
})

export const editCurrencySchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  symbols: languageStringSchema,
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
})

export const removeCurrencySchema = z.object({
  ids: z.array(idSchema).min(1),
})

export const duplicateCurrencySchema = z.object({
  ids: z.array(idSchema).min(1),
})

export const batchCurrencySchema = z.object({
  ids: z.array(idSchema).optional(),
  filters: z.object({
    names: z.string().trim().optional(),
    symbols: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    active: booleanArraySchema.optional(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  params: z.array(
    z.object({
      column: z.string(),
      value: z.any(),
    }),
  ).min(1),
}).refine(hasIdsOrFilters, {
  message: 'Either ids or filters are required.',
})

export const importCurrenciesSchema = z.object({
  file: z.instanceof(File),
})
