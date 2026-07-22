import { idSchema, idSchemaOptional, languageStringSchema, numberFromStringSchema } from '@remnant/shared'
import { z } from 'zod'
import { productDBPopulatedSchema } from './product.schema'

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

export const WarehouseTransactionDBPopulatedSchema = warehouseTransactionDBSchema.omit({
  fromWarehouse: true,
  toWarehouse: true,
  removed: true,
}).extend({
  fromWarehouse: z.object({
    id: idSchema,
    names: languageStringSchema,
  }),
  toWarehouse: z.object({
    id: idSchema,
    names: languageStringSchema,
  }),
})

export const warehouseTransactionItemDBSchema = z.object({
  _id: idSchema,
  transactionId: idSchema,
  productId: idSchema,
  quantity: z.number(),
  price: z.number(),
})

export const warehouseTransactionItemDBPopulatedSchema = warehouseTransactionItemDBSchema.extend({
  product: productDBPopulatedSchema,
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
