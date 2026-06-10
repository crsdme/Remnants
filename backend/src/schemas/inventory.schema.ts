import { idSchema } from '@remnant/shared'
import { z } from 'zod'

export const editInventoryItemsRepoSchema = z.object({
  id: z.string().trim(),
  quantity: z.number(),
})

export const createInventoryItemsRepoSchema = z.object({
  inventoryId: z.string().trim(),
  productId: z.string().trim(),
  quantity: z.number(),
  receivedQuantity: z.number(),
})

export const editInventoryRepoSchema = z.object({
  warehouse: idSchema,
  status: z.string().trim(),
  comment: z.string().trim().optional(),
})

export const createInventoriesRepoSchema = z.object({
  _id: idSchema,
  warehouse: idSchema,
  categories: z.array(idSchema).default([]),
  comment: z.string().trim().optional(),
})
