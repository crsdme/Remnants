import { z } from 'zod'
import { dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

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
