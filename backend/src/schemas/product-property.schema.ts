import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema, stringToBooleanSchema } from './common'

extendZodWithOpenApi(z)

export const getProductPropertySchema = z.object({
  filters: z.object({
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    priority: numberFromStringSchema.optional(),
    options: idSchema.optional(),
    isMultiple: stringToBooleanSchema.optional(),
    isRequired: stringToBooleanSchema.optional(),
    showInTable: stringToBooleanSchema.optional(),
    type: z.string().optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    active: booleanArraySchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    isMultiple: sorterParamsSchema.optional(),
    isRequired: sorterParamsSchema.optional(),
    showInTable: sorterParamsSchema.optional(),
    type: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export const createProductPropertySchema = z.object({
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  isMultiple: stringToBooleanSchema,
  isRequired: stringToBooleanSchema,
  showInTable: stringToBooleanSchema,
  type: z.string(),
  active: z.boolean().optional().default(true),
})

export const editProductPropertySchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  isMultiple: stringToBooleanSchema,
  isRequired: stringToBooleanSchema,
  showInTable: stringToBooleanSchema,
  type: z.string(),
  active: z.boolean().optional().default(true),
})

export const removeProductPropertySchema = z.object({
  ids: z.array(idSchema),
})
