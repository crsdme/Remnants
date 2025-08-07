import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { dateRangeSchema, idSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getInventoriesSchema = z.object({
  filters: z.object({
    status: z.string().trim().optional(),
    warehouse: idSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    status: sorterParamsSchema.optional(),
    warehouse: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export const createInventorySchema = z.object({
  warehouse: idSchema,
  category: idSchema,
  comment: z.string().trim().optional(),
  items: z.array(z.object({
    id: idSchema,
    quantity: z.number(),
    receivedQuantity: z.number(),
  })),
})

export const removeInventoriesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export const getInventoryItemsSchema = z.object({
  filters: z.object({
    transactionId: z.string().trim().optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export const editInventorySchema = z.object({
  category: idSchema,
  warehouse: idSchema,
  id: idSchema,
  comment: z.string().trim().optional(),
  items: z.array(z.object({
    id: idSchema,
    quantity: z.number(),
  })),
})

export const scanBarcodeToDraftSchema = z.object({
  filters: z.object({
    barcode: z.string().trim(),
    category: idSchema,
    inventoryId: idSchema.optional(),
  }),
  sorters: z.object({
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
})
