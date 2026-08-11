import { z } from 'zod'
import { dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema, stringToBooleanSchema } from './common'

export const orderStatusSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  color: z.string().optional(),
  isLocked: z.boolean().optional().default(false),
  isSelectable: z.boolean().optional().default(false),
  isDisplayed: z.boolean().optional().default(true),
  includeInStatistics: z.boolean().optional().default(true),
  ordersCount: z.number().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type OrderStatusDTO = z.output<typeof orderStatusSchema>

export const getOrderStatusesSchema = z.object({
  filters: z.object({
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    color: z.string().optional(),
    priority: numberFromStringSchema.optional(),
    includeCount: stringToBooleanSchema.optional(),
    isLocked: stringToBooleanSchema.optional(),
    isSelectable: stringToBooleanSchema.optional(),
    isDisplayed: stringToBooleanSchema.optional(),
    includeInStatistics: stringToBooleanSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    color: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
    isSelectable: sorterParamsSchema.optional(),
    isDisplayed: sorterParamsSchema.optional(),
    includeInStatistics: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetOrderStatusesRequest = z.input<typeof getOrderStatusesSchema>

export const createOrderStatusSchema = z.object({
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  color: z.string().optional(),
  isLocked: stringToBooleanSchema.optional(),
  isSelectable: stringToBooleanSchema.optional(),
  isDisplayed: stringToBooleanSchema.optional().default(true),
  includeInStatistics: stringToBooleanSchema.optional().default(true),
})

export type CreateOrderStatusRequest = z.input<typeof createOrderStatusSchema>

export const editOrderStatusSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  color: z.string().optional(),
  isLocked: stringToBooleanSchema.optional(),
  isSelectable: stringToBooleanSchema.optional(),
  isDisplayed: stringToBooleanSchema.optional(),
  includeInStatistics: stringToBooleanSchema.optional(),
})

export type EditOrderStatusRequest = z.input<typeof editOrderStatusSchema>

export const removeOrderStatusesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveOrderStatusesRequest = z.input<typeof removeOrderStatusesSchema>

export const getOrderStatusesResponseSchema = responseListSchema(orderStatusSchema)
export type GetOrderStatusesResponse = z.output<typeof getOrderStatusesResponseSchema>

export const createOrderStatusResponseSchema = responseItemSchema(orderStatusSchema)
export type CreateOrderStatusResponse = z.output<typeof createOrderStatusResponseSchema>

export const editOrderStatusResponseSchema = responseItemSchema(orderStatusSchema)
export type EditOrderStatusResponse = z.output<typeof editOrderStatusResponseSchema>

export const removeOrderStatusesResponseSchema = responseSchema
export type RemoveOrderStatusesResponse = z.output<typeof removeOrderStatusesResponseSchema>
