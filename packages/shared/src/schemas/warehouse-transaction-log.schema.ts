import { z } from 'zod'
import {
  dateRangeSchema,
  idSchema,
  idSchemaOptional,
  languageStringSchema,
  paginationSchema,
  responseListSchema,
  responseSchema,
  sorterParamsSchema,
} from './common'

export const warehouseTransactionLogSchema = z.object({
  id: idSchema,
  productId: idSchema,
  warehouseId: idSchema,
  deltaCount: z.number().int(),
  refType: z.string().trim(),
  refId: idSchema,
  userId: idSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type WarehouseTransactionLogDTO = z.output<typeof warehouseTransactionLogSchema>

export const warehouseTransactionLogPopulatedSchema = z.object({
  id: idSchema,
  deltaCount: z.number().int(),
  refType: z.string().trim(),
  refId: idSchema,
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
    productId: idSchemaOptional,
    warehouseId: idSchemaOptional,
    refType: z.string().trim().optional(),
    refId: idSchemaOptional,
    userId: idSchemaOptional,
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
  productId: idSchema,
  warehouseId: idSchema,
  deltaCount: z.number().int(),
  refType: z.string().trim(),
  refId: idSchema,
  userId: idSchema,
})

export type CreateWarehouseTransactionLogsRequest = z.input<typeof createWarehouseTransactionLogsSchema>

export const createWarehouseTransactionLogsResponseSchema = responseSchema
export type CreateWarehouseTransactionLogsResponse = z.output<typeof createWarehouseTransactionLogsResponseSchema>

export const getWarehouseTransactionLogsResponseSchema = responseListSchema(warehouseTransactionLogPopulatedSchema)
export type GetWarehouseTransactionLogsResponse = z.output<typeof getWarehouseTransactionLogsResponseSchema>
