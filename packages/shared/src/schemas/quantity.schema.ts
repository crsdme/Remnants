import { z } from 'zod'
import { idSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'

export const quantitySchema = z.object({
  id: idSchema,
  count: z.number(),
  productId: idSchema,
  warehouse: idSchema,
  status: z.enum(['available', 'reserved', 'sold']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type QuantityDTO = z.output<typeof quantitySchema>

export const getQuantitiesSchema = z.object({
  filters: z.object({
    productId: idSchema.optional(),
    warehouse: idSchema.optional(),
    status: z.enum(['available', 'reserved', 'sold']).optional(),
    count: z.number().optional(),
  }).optional().default({}),
  sorters: z.object({
    count: sorterParamsSchema.optional(),
    status: sorterParamsSchema.optional(),
    warehouse: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetQuantitiesRequest = z.input<typeof getQuantitiesSchema>

export const createQuantitiesSchema = z.object({
  count: z.number(),
  productId: idSchema,
  warehouse: idSchema,
})

export type CreateQuantitiesRequest = z.input<typeof createQuantitiesSchema>

export const editQuantitiesSchema = z.object({
  id: idSchema,
  count: z.number(),
  productId: idSchema,
  warehouse: idSchema,
})

export type EditQuantitiesRequest = z.input<typeof editQuantitiesSchema>

export const removeQuantitiesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveQuantitiesRequest = z.input<typeof removeQuantitiesSchema>

export const countQuantitiesSchema = z.object({
  productId: idSchema,
  warehouse: idSchema,
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
