import { idSchema, idSchemaOptional } from '@remnant/shared'

import { z } from 'zod'

export const inventoryDBSchema = z.object({

  _id: idSchema,
  seq: z.number(),
  status: z.enum(['draft', 'confirmed', 'awaiting', 'received', 'cancelled']),
  warehouse: idSchema,
  categoriesIds: z.array(idSchema),
  createdBy: idSchema,
  removedBy: idSchemaOptional.nullable(),
  comment: z.string().default(''),
  removedAt: z.coerce.date().nullable(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const inventoryItemDBSchema = z.object({
  _id: idSchema,
  inventoryId: idSchema,
  productId: idSchema,
  quantity: z.number(),
  receivedQuantity: z.number(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
})

export const createInventoriesRepoSchema = z.object({
  _id: idSchema,
  warehouse: idSchema,
  categoriesIds: z.array(idSchema).min(1),
  createdBy: idSchema,
  status: z.enum(['draft', 'confirmed', 'awaiting', 'received', 'cancelled']).optional().default('confirmed'),
  comment: z.string().trim().optional(),
})

export const createInventoryItemsRepoSchema = z.object({
  inventoryId: idSchema,
  productId: idSchema,
  quantity: z.number(),
  receivedQuantity: z.number(),
})

export const editInventoryRepoSchema = z.object({
  warehouse: idSchema.optional(),
  categoriesIds: z.array(idSchema).min(1).optional(),
  status: z.enum(['draft', 'confirmed', 'awaiting', 'received', 'cancelled']).optional(),
  comment: z.string().trim().optional(),
})

export const editInventoryItemsRepoSchema = z.object({
  id: idSchema,
  quantity: z.number().optional(),
  receivedQuantity: z.number().optional(),
})
