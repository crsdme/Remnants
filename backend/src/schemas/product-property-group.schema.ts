import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getProductPropertyGroupSchema = z.object({
  filters: z.object({
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    productProperties: idSchema.optional(),
    active: booleanArraySchema.optional(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export const createProductPropertyGroupSchema = z.object({
  names: languageStringSchema,
  productProperties: z.array(idSchema).optional(),
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
})

export const editProductPropertyGroupSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  productProperties: z.array(idSchema).optional(),
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
})

export const removeProductPropertyGroupSchema = z.object({
  ids: z.array(idSchema).min(1),
})
