import { z } from 'zod'
import { dateRangeSchema, idSchema, languageStringSchema, paginationSchema, responseItemSchema, responseListSchema, sorterParamsSchema } from './common'

export const warehouseTransactionLogSchema = z.object({
  id: idSchema,
  productId: z.string().trim(),
  warehouseId: z.string().trim(),
  deltaCount: z.number().int(),
  refType: z.string().trim(),
  refId: z.string().trim(),
  userId: z.string().trim(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type WarehouseTransactionLogDTO = z.output<typeof warehouseTransactionLogSchema>

export const warehouseTransactionLogPopulatedSchema = z.object({
  id: idSchema,
  deltaCount: z.number().int(),
  refType: z.string().trim(),
  refId: z.string().trim(),
  user: z.object({
    id: idSchema,
    name: z.string().trim(),
  }),
  warehouse: z.object({
    id: idSchema,
    names: languageStringSchema,
  }),
  resource: z.object({
    id: idSchema,
    seq: z.string().trim(),
    name: z.string().trim(),
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type WarehouseTransactionLogPopulatedDTO = z.output<typeof warehouseTransactionLogPopulatedSchema>

export const getWarehouseTransactionLogsSchema = z.object({
  filters: z.object({
    productId: z.string().trim().optional(),
    warehouseId: z.string().trim().optional(),
    refType: z.string().trim().optional(),
    refId: z.string().trim().optional(),
    userId: z.string().trim().optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    productId: sorterParamsSchema.optional(),
    warehouseId: sorterParamsSchema.optional(),
    refType: sorterParamsSchema.optional(),
    refId: sorterParamsSchema.optional(),
    userId: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetWarehouseTransactionLogsRequest = z.input<typeof getWarehouseTransactionLogsSchema>

export const createWarehouseTransactionLogsSchema = z.object({
  productId: z.string().trim(),
  warehouseId: z.string().trim(),
  deltaCount: z.number().int(),
  refType: z.string().trim(),
  refId: z.string().trim(),
  userId: z.string().trim(),
})

export type CreateWarehouseTransactionLogsRequest = z.input<typeof createWarehouseTransactionLogsSchema>

export const createWarehouseTransactionLogsResponseSchema = responseItemSchema(warehouseTransactionLogSchema)
export type CreateWarehouseTransactionLogsResponse = z.output<typeof createWarehouseTransactionLogsResponseSchema>

export const getWarehouseTransactionLogsResponseSchema = responseListSchema(warehouseTransactionLogPopulatedSchema)
export type GetWarehouseTransactionLogsResponse = z.output<typeof getWarehouseTransactionLogsResponseSchema>
