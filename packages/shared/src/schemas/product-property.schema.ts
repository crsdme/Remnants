import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, idSchemaOptional, languageStringSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema, stringToBooleanSchema } from './common'

export const productPropertySchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  symbols: languageStringSchema,
  options: z.array(idSchema),
  priority: z.number(),
  isRequired: z.boolean(),
  showInTable: z.boolean(),
  showInStatistics: z.boolean(),
  type: z.string(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProductPropertyDTO = z.output<typeof productPropertySchema>

export const getProductPropertySchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).default([]),
    names: z.string().trim().optional(),
    symbols: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    priority: numberFromStringSchema.optional(),
    options: idSchemaOptional,
    isRequired: stringToBooleanSchema.optional(),
    showInTable: stringToBooleanSchema.optional(),
    showInStatistics: stringToBooleanSchema.optional(),
    type: z.string().optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    active: booleanArraySchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    isRequired: sorterParamsSchema.optional(),
    showInTable: sorterParamsSchema.optional(),
    symbols: sorterParamsSchema.optional(),
    type: sorterParamsSchema.optional(),
    showInStatistics: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetProductPropertyRequest = z.input<typeof getProductPropertySchema>

export const createProductPropertySchema = z.object({
  names: languageStringSchema,
  symbols: languageStringSchema,
  priority: z.number().optional().default(0),
  isRequired: stringToBooleanSchema,
  showInTable: stringToBooleanSchema,
  showInStatistics: stringToBooleanSchema,
  type: z.string(),
  active: z.boolean().optional().default(true),
})

export type CreateProductPropertyRequest = z.input<typeof createProductPropertySchema>

export const editProductPropertySchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  symbols: languageStringSchema,
  priority: z.number().optional().default(0),
  isRequired: stringToBooleanSchema,
  showInTable: stringToBooleanSchema,
  showInStatistics: stringToBooleanSchema,
  type: z.string(),
  active: z.boolean().optional().default(true),
})

export type EditProductPropertyRequest = z.input<typeof editProductPropertySchema>

export const removeProductPropertySchema = z.object({
  ids: z.array(idSchema),
})

export type RemoveProductPropertyRequest = z.input<typeof removeProductPropertySchema>

export const getProductPropertiesResponseSchema = responseListSchema(productPropertySchema)
export type GetProductPropertiesResponse = z.output<typeof getProductPropertiesResponseSchema>

export const createProductPropertyResponseSchema = responseItemSchema(productPropertySchema)
export type CreateProductPropertyResponse = z.output<typeof createProductPropertyResponseSchema>

export const editProductPropertyResponseSchema = responseItemSchema(productPropertySchema)
export type EditProductPropertyResponse = z.output<typeof editProductPropertyResponseSchema>

export const removeProductPropertiesResponseSchema = responseSchema
export type RemoveProductPropertiesResponse = z.output<typeof removeProductPropertiesResponseSchema>
