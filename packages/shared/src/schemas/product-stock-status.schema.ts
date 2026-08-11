import { z } from 'zod'
import {
  booleanArraySchema,
  dateRangeSchema,
  idSchema,
  languageStringSchema,
  numberFromStringSchema,
  paginationSchema,
  responseItemSchema,
  responseListSchema,
  responseSchema,
  sorterParamsSchema,
  stringToBooleanSchema,
} from './common'

export const productStockStatusConditionFieldSchema = z.enum([
  'qty',
  'daysSinceLastSale',
  'daysSinceQtyChange',
])
export type ProductStockStatusConditionField = z.output<typeof productStockStatusConditionFieldSchema>

export const productStockStatusConditionOperatorSchema = z.enum([
  'eq',
  'neq',
  'lt',
  'lte',
  'gt',
  'gte',
])
export type ProductStockStatusConditionOperator = z.output<typeof productStockStatusConditionOperatorSchema>

export const productStockStatusConditionSchema = z.object({
  field: productStockStatusConditionFieldSchema,
  operator: productStockStatusConditionOperatorSchema,
  value: z.number(),
})
export type ProductStockStatusCondition = z.output<typeof productStockStatusConditionSchema>

export const productStockStatusSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  color: z.string().optional(),
  active: z.boolean().optional().default(true),
  isDefault: z.boolean().optional().default(false),
  conditions: z.array(productStockStatusConditionSchema).optional().default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProductStockStatusDTO = z.output<typeof productStockStatusSchema>

export const getProductStockStatusesSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    color: z.string().optional(),
    priority: numberFromStringSchema.optional(),
    active: booleanArraySchema.optional(),
    isDefault: stringToBooleanSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    color: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    isDefault: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetProductStockStatusesRequest = z.input<typeof getProductStockStatusesSchema>

export const createProductStockStatusSchema = z.object({
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  color: z.string().optional(),
  active: stringToBooleanSchema.optional().default(true),
  isDefault: stringToBooleanSchema.optional().default(false),
  conditions: z.array(productStockStatusConditionSchema).optional().default([]),
})

export type CreateProductStockStatusRequest = z.input<typeof createProductStockStatusSchema>

export const editProductStockStatusSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  color: z.string().optional(),
  active: stringToBooleanSchema.optional(),
  isDefault: stringToBooleanSchema.optional(),
  conditions: z.array(productStockStatusConditionSchema).optional().default([]),
})

export type EditProductStockStatusRequest = z.input<typeof editProductStockStatusSchema>

export const removeProductStockStatusesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveProductStockStatusesRequest = z.input<typeof removeProductStockStatusesSchema>

export const getProductStockStatusesResponseSchema = responseListSchema(productStockStatusSchema)
export type GetProductStockStatusesResponse = z.output<typeof getProductStockStatusesResponseSchema>

export const createProductStockStatusResponseSchema = responseItemSchema(productStockStatusSchema)
export type CreateProductStockStatusResponse = z.output<typeof createProductStockStatusResponseSchema>

export const editProductStockStatusResponseSchema = responseItemSchema(productStockStatusSchema)
export type EditProductStockStatusResponse = z.output<typeof editProductStockStatusResponseSchema>

export const removeProductStockStatusesResponseSchema = responseSchema
export type RemoveProductStockStatusesResponse = z.output<typeof removeProductStockStatusesResponseSchema>
