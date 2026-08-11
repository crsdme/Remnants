import { z } from 'zod'
import { idSchema, idSchemaOptional, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'

export const quantitySchema = z.object({
  id: idSchema,
  count: z.number(),
  productId: idSchema,
  warehouseId: idSchema,
  status: z.enum(['available', 'reserved', 'sold']),
  stockStatusId: idSchema.nullable().optional(),
  lastSaleAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type QuantityDTO = z.output<typeof quantitySchema>

export const getQuantitiesSchema = z.object({
  filters: z.object({
    productId: idSchemaOptional,
    warehouseId: idSchemaOptional,
    status: z.enum(['available', 'reserved', 'sold']).optional(),
    count: z.number().optional(),
  }).optional().default({}),
  sorters: z.object({
    count: sorterParamsSchema.optional(),
    status: sorterParamsSchema.optional(),
    warehouseId: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetQuantitiesRequest = z.input<typeof getQuantitiesSchema>

export const createQuantitiesSchema = z.object({
  count: z.number(),
  productId: idSchema,
  warehouseId: idSchema,
})

export type CreateQuantitiesRequest = z.input<typeof createQuantitiesSchema>

export const editQuantitiesSchema = z.object({
  id: idSchema,
  count: z.number(),
  productId: idSchema,
  warehouseId: idSchema,
})

export type EditQuantitiesRequest = z.input<typeof editQuantitiesSchema>

export const removeQuantitiesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveQuantitiesRequest = z.input<typeof removeQuantitiesSchema>

export const countQuantitiesSchema = z.object({
  productId: idSchema,
  warehouseId: idSchema,
  mode: z.enum(['inc', 'dec', 'set']).optional().default('inc'),
  count: z.number(),
  userId: idSchema,
  refType: z.enum(['product', 'warehouse', 'order', 'warehouse-transaction', 'inventory']).optional().default('product'),
  refId: idSchema,
})

export type CountQuantitiesRequest = z.input<typeof countQuantitiesSchema>

export const getQuantitiesResponseSchema = responseListSchema(quantitySchema)
export type GetQuantitiesResponse = z.output<typeof getQuantitiesResponseSchema>

export const createQuantitiesResponseSchema = responseItemSchema(quantitySchema)
export type CreateQuantitiesResponse = z.output<typeof createQuantitiesResponseSchema>

export const editQuantitiesResponseSchema = responseItemSchema(quantitySchema)
export type EditQuantitiesResponse = z.output<typeof editQuantitiesResponseSchema>

export const removeQuantitiesResponseSchema = responseSchema
export type RemoveQuantitiesResponse = z.output<typeof removeQuantitiesResponseSchema>

export const countQuantitiesResponseSchema = responseSchema
export type CountQuantitiesResponse = z.output<typeof countQuantitiesResponseSchema>
