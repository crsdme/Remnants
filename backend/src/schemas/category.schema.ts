import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema, stringToBooleanSchema } from './common'

extendZodWithOpenApi(z)

function hasIdsOrFilters(data: {
  ids?: unknown
  filters?: unknown
}) {
  return !!data.ids || !!data.filters
}

export const getCategorySchema = z.object({
  pagination: paginationSchema.optional(),
  filters: z.object({
    names: z.string().optional(),
    language: z.string(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    active: booleanArraySchema.optional(),
  }).optional().default({ language: 'en' }),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  isTree: stringToBooleanSchema.optional().default(false),
})

export const createCategorySchema = z.object({
  names: languageStringSchema,
  priority: z.number(),
  parent: idSchema.optional(),
  active: z.boolean().optional(),
})

export const editCategorySchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: numberFromStringSchema,
  parent: idSchema.optional(),
  active: z.boolean().optional(),
})

export const removeCategorySchema = z.object({
  ids: z.array(idSchema),
})

export const duplicateCategorySchema = z.object({
  ids: z.array(idSchema),
})

export const batchCategorySchema = z.object({
  ids: z.array(idSchema).optional(),
  filters: z.object({
    names: z.string().optional(),
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
  message: 'Either ids or filters are required.',
})

export const importCategoriesSchema = z.object({
  file: z.instanceof(File),
})

export const exportCategoriesSchema = z.object({
  ids: z.array(idSchema).optional(),
})
