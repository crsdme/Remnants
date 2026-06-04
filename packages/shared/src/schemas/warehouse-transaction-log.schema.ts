import { z } from 'zod'
import { dateRangeSchema, paginationSchema, sorterParamsSchema } from './common'

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
