import { z } from 'zod'
import { dateRangeSchema, idSchema, paginationSchema, sorterParamsSchema } from './common'

export const getInventoriesSchema = z.object({
  filters: z.object({
    seq: z.string().optional(),
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

export type GetInventoriesRequest = z.input<typeof getInventoriesSchema>

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

export type CreateInventoryRequest = z.input<typeof createInventorySchema>

export const removeInventoriesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveInventoriesRequest = z.input<typeof removeInventoriesSchema>

export const getInventoryItemsSchema = z.object({
  filters: z.object({
    transactionId: z.string().trim().optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetInventoryItemsRequest = z.input<typeof getInventoryItemsSchema>

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

export type EditInventoryRequest = z.input<typeof editInventorySchema>

export const scanBarcodeToDraftsSchema = z.object({
  filters: z.object({
    barcode: z.string().trim(),
    category: idSchema,
    inventoryId: idSchema.optional(),
  }),
  sorters: z.object({
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
})

export type ScanBarcodeToDraftsRequest = z.input<typeof scanBarcodeToDraftsSchema>
