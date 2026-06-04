import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema, stringToBooleanSchema } from './common'

function hasIdsOrFilters(data: {
  ids?: unknown
  filters?: unknown
}) {
  return !!data.ids || !!data.filters
}

export const getCategoriesSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).default([]),
    names: z.string().trim().optional(),
    language: z.string().default('en'),
    priority: numberFromStringSchema.optional(),
    parent: idSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    active: booleanArraySchema.optional(),
  }).default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    parent: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional(),
  pagination: paginationSchema.optional().default({}),
  isTree: stringToBooleanSchema.optional().default(false),
})

export type GetCategoriesRequest = z.input<typeof getCategoriesSchema>

export const createCategorySchema = z.object({
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  parent: idSchema.optional(),
  active: z.boolean().optional().default(true),
})

export type CreateCategoryRequest = z.input<typeof createCategorySchema>

export const editCategorySchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  parent: idSchema.optional(),
  active: z.boolean().optional().default(true),
})

export type EditCategoryRequest = z.input<typeof editCategorySchema>

export const removeCategoriesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveCategoriesRequest = z.input<typeof removeCategoriesSchema>

export const duplicateCategorySchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type DuplicateCategoryRequest = z.input<typeof duplicateCategorySchema>

export const batchCategorySchema = z.object({
  ids: z.array(idSchema).min(1).optional(),
  filters: z.object({
    names: z.string().trim().optional(),
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

export type BatchCategoryRequest = z.input<typeof batchCategorySchema>

export const importCategoriesSchema = z.object({
  file: z.instanceof(File),
})

export type ImportCategoriesRequest = z.input<typeof importCategoriesSchema>

export const exportCategoriesSchema = z.object({
  ids: z.array(idSchema).optional(),
})

export type ExportCategoriesRequest = z.input<typeof exportCategoriesSchema>
