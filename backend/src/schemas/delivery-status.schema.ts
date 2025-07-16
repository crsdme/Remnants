import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getDeliveryStatusesSchema = z.object({
  filters: z.object({
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    color: z.string().optional(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    color: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export const createDeliveryStatusSchema = z.object({
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  color: z.string().optional(),
})

export const editDeliveryStatusSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  color: z.string().optional(),
})

export const removeDeliveryStatusesSchema = z.object({
  ids: z.array(idSchema).min(1),
})
