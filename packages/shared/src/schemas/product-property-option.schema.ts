import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, idSchemaOptional, languageStringSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'

export const productPropertyOptionSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number(),
  active: z.boolean(),
  color: z.string().optional(),
  productProperty: idSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProductPropertyOptionDTO = z.output<typeof productPropertyOptionSchema>

export const getProductPropertyOptionSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    priority: numberFromStringSchema.optional(),
    productProperty: idSchemaOptional,
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

export type GetProductPropertyOptionRequest = z.input<typeof getProductPropertyOptionSchema>

export const createProductPropertyOptionSchema = z.object({
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
  color: z.string().optional(),
  productProperty: idSchema,
})

export type CreateProductPropertyOptionRequest = z.input<typeof createProductPropertyOptionSchema>

export const editProductPropertyOptionSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  productProperty: idSchema,
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
  color: z.string().optional(),
})

export type EditProductPropertyOptionRequest = z.input<typeof editProductPropertyOptionSchema>

export const removeProductPropertyOptionSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveProductPropertyOptionRequest = z.input<typeof removeProductPropertyOptionSchema>

export const getProductPropertyOptionsResponseSchema = responseListSchema(productPropertyOptionSchema)
export type GetProductPropertyOptionsResponse = z.output<typeof getProductPropertyOptionsResponseSchema>

export const createProductPropertyOptionResponseSchema = responseItemSchema(productPropertyOptionSchema)
export type CreateProductPropertyOptionResponse = z.output<typeof createProductPropertyOptionResponseSchema>

export const editProductPropertyOptionResponseSchema = responseItemSchema(productPropertyOptionSchema)
export type EditProductPropertyOptionResponse = z.output<typeof editProductPropertyOptionResponseSchema>

export const removeProductPropertyOptionsResponseSchema = responseSchema
export type RemoveProductPropertyOptionsResponse = z.output<typeof removeProductPropertyOptionsResponseSchema>
