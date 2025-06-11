import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getProductPropertyOptionSchema = z.object({
  pagination: paginationSchema.optional(),
  filters: z.object({
    ids: z.array(idSchema).optional(),
    names: z.string().optional(),
    language: z.string(),
    priority: numberFromStringSchema.optional(),
    productProperty: idSchema.optional(),
    active: booleanArraySchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({ language: 'en' }),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
})

export const createProductPropertyOptionSchema = z.object({
  names: languageStringSchema,
  priority: z.number(),
  active: z.boolean().optional(),
  color: z.string().optional(),
  productProperty: idSchema,
})

export const editProductPropertyOptionSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  productProperty: idSchema,
  priority: numberFromStringSchema,
  active: z.boolean().optional(),
  color: z.string().optional(),
})

export const removeProductPropertyOptionSchema = z.object({
  ids: z.array(idSchema),
})
