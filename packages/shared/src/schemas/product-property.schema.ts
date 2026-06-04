import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema, stringToBooleanSchema } from './common'

export const getProductPropertySchema = z.object({
  filters: z.object({
    names: z.string().trim().optional(),
    symbols: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    priority: numberFromStringSchema.optional(),
    options: idSchema.optional(),
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
