import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, idSchemaOptional, languageStringSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema, stringToBooleanSchema } from './common'

export const categorySchema = z.object({
  id: idSchema,
  seq: z.number(),
  names: languageStringSchema,
  priority: numberFromStringSchema,
  parent: idSchemaOptional,
  active: z.boolean().optional().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CategoryDTO = z.output<typeof categorySchema>

export const getCategoriesSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).default([]),
    names: z.string().trim().optional(),
    language: z.string().default('en'),
    priority: numberFromStringSchema.optional(),
    parent: idSchemaOptional,
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
  parent: idSchemaOptional,
  active: z.boolean().optional().default(true),
})

export type CreateCategoryRequest = z.input<typeof createCategorySchema>

export const editCategorySchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  parent: idSchemaOptional,
  active: z.boolean().optional().default(true),
})

export type EditCategoryRequest = z.input<typeof editCategorySchema>

export const removeCategoriesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveCategoriesRequest = z.input<typeof removeCategoriesSchema>

export const getCategoriesResponseSchema = responseListSchema(categorySchema)
export type GetCategoriesResponse = z.output<typeof getCategoriesResponseSchema>

export const createCategoryResponseSchema = responseItemSchema(categorySchema)
export type CreateCategoryResponse = z.output<typeof createCategoryResponseSchema>

export const editCategoryResponseSchema = responseItemSchema(categorySchema)
export type EditCategoryResponse = z.output<typeof editCategoryResponseSchema>

export const removeCategoriesResponseSchema = responseSchema
export type RemoveCategoriesResponse = z.output<typeof removeCategoriesResponseSchema>
