import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema } from './common'

extendZodWithOpenApi(z)

function hasIdsOrFilters(data: {
  _ids?: unknown
  filters?: unknown
}) {
  return !!data._ids || !!data.filters
}

export const getUnitSchema = z.object({
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
    names: numberFromStringSchema.optional(),
    priority: numberFromStringSchema.optional(),
    updatedAt: numberFromStringSchema.optional(),
    createdAt: numberFromStringSchema.optional(),
  }).optional().default({}),
})

export const createUnitSchema = z.object({
  names: languageStringSchema,
  symbols: languageStringSchema,
  priority: z.number(),
  active: z.boolean().optional(),
})

export const editUnitSchema = z.object({
  _id: idSchema,
  names: languageStringSchema,
  symbols: languageStringSchema,
  priority: numberFromStringSchema,
  active: z.boolean().optional(),
})

export const removeUnitSchema = z.object({
  _ids: z.array(idSchema),
})

export const duplicateUnitSchema = z.object({
  _ids: z.array(idSchema),
})

export const batchUnitSchema = z.object({
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

export const importUnitsSchema = z.object({
  file: z.instanceof(File),
})
