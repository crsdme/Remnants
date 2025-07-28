import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema, stringToBooleanSchema } from './common'

extendZodWithOpenApi(z)

export const getOrderStatusesSchema = z.object({
  filters: z.object({
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    color: z.string().optional(),
    priority: numberFromStringSchema.optional(),
    includeAll: stringToBooleanSchema.optional(),
    includeCount: stringToBooleanSchema.optional(),
    isLocked: stringToBooleanSchema.optional(),
    isSelectable: stringToBooleanSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    color: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
    isSelectable: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export const createOrderStatusSchema = z.object({
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  color: z.string().optional(),
  isLocked: stringToBooleanSchema.optional(),
  isSelectable: stringToBooleanSchema.optional(),
})

export const editOrderStatusSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  color: z.string().optional(),
  isLocked: stringToBooleanSchema.optional(),
  isSelectable: stringToBooleanSchema.optional(),
})

export const removeOrderStatusesSchema = z.object({
  ids: z.array(idSchema).min(1),
})
