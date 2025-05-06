import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

function hasIdsOrFilters(data: {
  _ids?: unknown
  filters?: unknown
}) {
  return !!data._ids || !!data.filters
}

export const getCurrencySchema = z.object({
  pagination: paginationSchema.optional(),
  filters: z.object({
    names: z.string().optional(),
    symbols: z.string().optional(),
    language: z.string(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    active: booleanArraySchema.optional(),
  }).optional().default({ language: 'en' }),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    symbols: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
})

export const createCurrencySchema = z.object({
  names: languageStringSchema,
  symbols: languageStringSchema,
  priority: z.number(),
  active: z.boolean().optional(),
})

export const editCurrencySchema = z.object({
  _id: idSchema,
  names: languageStringSchema,
  symbols: languageStringSchema,
  priority: numberFromStringSchema,
  active: z.boolean().optional(),
})

export const removeCurrencySchema = z.object({
  _ids: z.array(idSchema),
})

export const duplicateCurrencySchema = z.object({
  _ids: z.array(idSchema),
})

export const batchCurrencySchema = z.object({
  _ids: z.array(idSchema).optional(),
  filters: z.object({
    names: z.string().optional(),
    symbols: z.string().optional(),
    language: z.string(),
    active: booleanArraySchema.optional(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional(),
  params: z.array(
    z.object({
      column: z.string(),
      value: z.any(),
    }),
  ),
}).refine(hasIdsOrFilters, {
  message: 'Either _ids or filters are required.',
})

export const importCurrenciesSchema = z.object({
  file: z.instanceof(File),
})
