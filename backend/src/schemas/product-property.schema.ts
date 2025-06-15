import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema, stringToBooleanSchema } from './common'

extendZodWithOpenApi(z)

export const getProductPropertySchema = z.object({
  pagination: paginationSchema.optional(),
  filters: z.object({
    names: z.string().optional(),
    language: z.string(),
    priority: numberFromStringSchema.optional(),
    options: idSchema.optional(),
    isMultiple: stringToBooleanSchema.optional(),
    isRequired: stringToBooleanSchema.optional(),
    showInTable: stringToBooleanSchema.optional(),
    type: z.string().optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    active: booleanArraySchema.optional(),
  }).optional().default({ language: 'en' }),
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
})

export const createProductPropertySchema = z.object({
  names: languageStringSchema,
  priority: z.number(),
  isMultiple: stringToBooleanSchema.optional(),
  isRequired: stringToBooleanSchema.optional(),
  showInTable: stringToBooleanSchema.optional(),
  type: z.string().optional(),
  active: z.boolean().optional(),
})

export const editProductPropertySchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: numberFromStringSchema,
  isMultiple: stringToBooleanSchema.optional(),
  isRequired: stringToBooleanSchema.optional(),
  showInTable: stringToBooleanSchema.optional(),
  type: z.string().optional(),
  active: z.boolean().optional(),
})

export const removeProductPropertySchema = z.object({
  ids: z.array(idSchema),
})
