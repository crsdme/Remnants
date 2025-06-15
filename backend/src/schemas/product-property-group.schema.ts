import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getProductPropertyGroupSchema = z.object({
  pagination: paginationSchema.optional(),
  filters: z.object({
    names: z.string().optional(),
    language: z.string(),
    productProperties: idSchema.optional(),
    active: booleanArraySchema.optional(),
    priority: numberFromStringSchema.optional(),
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

export const createProductPropertyGroupSchema = z.object({
  names: languageStringSchema,
  productProperties: z.array(idSchema).optional(),
  priority: z.number(),
  active: z.boolean().optional(),
})

export const editProductPropertyGroupSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  productProperties: z.array(idSchema).optional(),
  priority: numberFromStringSchema,
  active: z.boolean().optional(),
})

export const removeProductPropertyGroupSchema = z.object({
  ids: z.array(idSchema),
})
