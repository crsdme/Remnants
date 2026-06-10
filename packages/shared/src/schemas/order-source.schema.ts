import { z } from 'zod'
import { dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'

export const orderSourceSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  color: z.string().optional(),
  removed: z.boolean().optional().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type OrderSourceDTO = z.output<typeof orderSourceSchema>

export const getOrderSourcesSchema = z.object({
  filters: z.object({
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    color: z.string().optional(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    color: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetOrderSourcesRequest = z.input<typeof getOrderSourcesSchema>

export const createOrderSourceSchema = z.object({
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  color: z.string().optional(),
})

export type CreateOrderSourceRequest = z.input<typeof createOrderSourceSchema>

export const editOrderSourceSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  color: z.string().optional(),
})

export type EditOrderSourceRequest = z.input<typeof editOrderSourceSchema>

export const removeOrderSourcesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveOrderSourcesRequest = z.input<typeof removeOrderSourcesSchema>

export const getOrderSourcesResponseSchema = responseListSchema(orderSourceSchema)
export type GetOrderSourcesResponse = z.output<typeof getOrderSourcesResponseSchema>

export const createOrderSourceResponseSchema = responseItemSchema(orderSourceSchema)
export type CreateOrderSourceResponse = z.output<typeof createOrderSourceResponseSchema>

export const editOrderSourceResponseSchema = responseItemSchema(orderSourceSchema)
export type EditOrderSourceResponse = z.output<typeof editOrderSourceResponseSchema>

export const removeOrderSourcesResponseSchema = responseSchema
export type RemoveOrderSourcesResponse = z.output<typeof removeOrderSourcesResponseSchema>
