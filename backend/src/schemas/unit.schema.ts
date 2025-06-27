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

export const getUnitSchema = z.object({
  pagination: paginationSchema.optional(),
  filters: z.object({
    names: z.string().optional(),
    symbols: z.string().optional(),
    language: z.string().optional(),
    priority: numberFromStringSchema.optional(),
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
})

export const createUnitSchema = z.object({
  names: languageStringSchema,
  symbols: languageStringSchema,
  priority: z.number(),
  active: z.boolean().optional(),
})

export const editUnitSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  symbols: languageStringSchema,
  priority: numberFromStringSchema,
  active: z.boolean().optional(),
})

export const removeUnitSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export const duplicateUnitSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export const batchUnitSchema = z.object({
  ids: z.array(idSchema).optional(),
  filters: z.object({
    names: z.string().optional(),
    symbols: z.string().optional(),
    language: z.string().optional(),
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

export const importUnitsSchema = z.object({
  file: z.instanceof(File),
})
