import { z } from 'zod'
import { dateRangeSchema, idSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

export const getExpenseCategoriesSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    names: z.string().trim().optional(),
    color: z.string().trim().optional(),
    priority: numberFromStringSchema.optional(),
    comment: z.string().trim().optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    priority: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetExpenseCategoriesRequest = z.input<typeof getExpenseCategoriesSchema>

export const createExpenseCategorySchema = z.object({
  names: z.record(z.string().trim()),
  color: z.string().trim(),
  priority: numberFromStringSchema,
  comment: z.string().optional(),
})

export type CreateExpenseCategoryRequest = z.input<typeof createExpenseCategorySchema>

export const editExpenseCategorySchema = z.object({
  id: idSchema,
  names: z.record(z.string().trim()),
  color: z.string().trim(),
  priority: numberFromStringSchema,
  comment: z.string().optional(),
})

export type EditExpenseCategoryRequest = z.input<typeof editExpenseCategorySchema>

export const removeExpenseCategoriesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveExpenseCategoriesRequest = z.input<typeof removeExpenseCategoriesSchema>
