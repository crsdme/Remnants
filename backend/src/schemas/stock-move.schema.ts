import { idSchema } from '@remnant/shared'
import { z } from 'zod'

export const stockLocationKindDBSchema = z.enum([
  'warehouse',
  'supplier',
  'customer',
  'transit',
  'adjustment',
])

export const stockDocumentTypeDBSchema = z.enum([
  'order',
  'warehouse-transaction',
  'inventory',
  'procurement',
  'migration',
])

export const stockMoveLayerDBSchema = z.object({
  lotId: idSchema,
  quantity: z.number().int(),
  minorUnitCost: z.number(),
  currencyId: idSchema,
  receivedAt: z.coerce.date(),
})

export const stockMoveDBSchema = z.object({
  _id: idSchema,
  productId: idSchema,
  fromKind: stockLocationKindDBSchema,
  toKind: stockLocationKindDBSchema,
  fromWarehouseId: idSchema.nullable().optional(),
  toWarehouseId: idSchema.nullable().optional(),
  quantity: z.number().int(),
  openQuantity: z.number().int(),
  layers: z.array(stockMoveLayerDBSchema),
  documentType: stockDocumentTypeDBSchema,
  documentId: idSchema,
  documentItemId: idSchema.nullable().optional(),
  userId: idSchema.nullable().optional(),
  cancelled: z.boolean(),
  cancelledAt: z.coerce.date().nullable().optional(),
  cancelledBy: idSchema.nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
