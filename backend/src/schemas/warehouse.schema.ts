import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getWarehousesSchema = z.object({
  pagination: paginationSchema.optional(),
  filters: z.object({
    names: z.string().optional(),
    priority: numberFromStringSchema.optional(),
    active: booleanArraySchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    priority: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
  }).optional().default({}),
})

export const createWarehousesSchema = z.object({
  names: languageStringSchema,
  priority: z.number(),
  active: z.boolean().optional(),
})

export const editWarehousesSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: numberFromStringSchema,
  active: z.boolean().optional(),
})

export const removeWarehousesSchema = z.object({
  ids: z.array(idSchema).min(1),
})
