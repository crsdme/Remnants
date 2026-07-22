import { idSchema, idSchemaOptional, numberFromStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const warehouseTransactionDBSchema = z.object({
  _id: idSchema,
  seq: numberFromStringSchema,
  type: z.string(),
  fromWarehouse: idSchema,
  toWarehouse: idSchema,
  requiresReceiving: z.boolean(),
  status: z.string(),
  accepted: z.boolean(),
  acceptedBy: idSchema,
  createdBy: idSchema,
  removedBy: idSchema,
  comment: z.string(),
  removedAt: z.coerce.date(),
  removed: z.boolean().default(false),
  acceptedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const warehouseTransactionItemDBSchema = z.object({
  _id: idSchema,
  transactionId: idSchema,
  productId: idSchema,
  quantity: z.number(),
  price: z.number(),
})

export const editWarehouseTransactionRepoSchema = z.object({
  comment: z.string().trim().optional(),
  accepted: z.boolean().optional(),
  acceptedBy: idSchemaOptional,
  acceptedAt: z.date().optional(),
  status: z.enum(['draft', 'confirmed', 'awaiting', 'received', 'cancelled']).optional(),
})

export const editWarehouseTransactionItemRepoSchema = z.object({
  receivedQuantity: z.number().optional(),
})

export const createWarehouseTransactionItemsRepoSchema = z.object({
  transactionId: idSchema,
  productId: idSchema,
  quantity: z.number(),
  receivedQuantity: z.number().optional(),
})
