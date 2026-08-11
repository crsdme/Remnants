import { idSchema, idSchemaOptional, languageStringSchema, numberFromStringSchema } from '@remnant/shared'
import { z } from 'zod'
import { productDBPopulatedSchema } from './product.schema'

export const warehouseTransactionDBSchema = z.object({
  _id: idSchema,
  seq: numberFromStringSchema,
  type: z.string(),
  fromWarehouseId: idSchemaOptional,
  toWarehouseId: idSchemaOptional,
  requiresReceiving: z.boolean().optional().default(true),
  status: z.string(),
  accepted: z.boolean().optional().default(false),
  acceptedBy: idSchemaOptional,
  createdBy: idSchemaOptional,
  removedBy: idSchemaOptional,
  comment: z.string().optional().default(''),
  removedAt: z.coerce.date().optional().nullable(),
  removed: z.boolean().default(false),
  acceptedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const WarehouseTransactionDBPopulatedSchema = warehouseTransactionDBSchema.omit({
  _id: true,
  fromWarehouseId: true,
  toWarehouseId: true,
  removed: true,
}).extend({
  id: idSchema,
  fromWarehouse: z.object({
    id: idSchema,
    names: languageStringSchema,
  }).optional(),
  toWarehouse: z.object({
    id: idSchema,
    names: languageStringSchema,
  }).optional(),
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
