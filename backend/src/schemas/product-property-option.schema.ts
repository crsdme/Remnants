import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getProductPropertyOptionSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    priority: numberFromStringSchema.optional(),
    productProperty: idSchema.optional(),
    active: booleanArraySchema.optional(),
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

export const createProductPropertyOptionSchema = z.object({
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
  color: z.string().optional(),
  productProperty: idSchema,
})

export const editProductPropertyOptionSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  productProperty: idSchema,
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
  color: z.string().optional(),
})

export const removeProductPropertyOptionSchema = z.object({
  ids: z.array(idSchema).min(1),
})
