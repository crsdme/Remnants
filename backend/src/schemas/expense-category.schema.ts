import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { dateRangeSchema, idSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

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

export const createExpenseCategorySchema = z.object({
  names: z.record(z.string().trim()),
  color: z.string().trim(),
  priority: numberFromStringSchema,
  comment: z.string().optional(),
})

export const editExpenseCategorySchema = z.object({
  id: idSchema,
  names: z.record(z.string().trim()),
  color: z.string().trim(),
  priority: numberFromStringSchema,
  comment: z.string().optional(),
})

export const removeExpenseCategoriesSchema = z.object({
  ids: z.array(idSchema).min(1),
})
