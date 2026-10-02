import { idSchema } from '@remnant/shared'
import { z } from 'zod'

export const procurementDBSchema = z.object({
  _id: idSchema,
  seq: z.number(),
  supplierId: idSchema,
  warehouseId: idSchema.nullable().optional(),
  status: z.string(),
  paymentStatus: z.string(),
  expenseIds: z.array(idSchema),
  paymentIds: z.array(idSchema),
  createdBy: z.string(),
  removed: z.boolean().optional().default(false),
  removedBy: idSchema.nullable().optional(),
  comment: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const procurementItemDBSchema = z.object({
  _id: idSchema,
  procurementId: idSchema,
  productId: idSchema,
  quantity: z.number(),
  receivedQuantity: z.number(),
  minorPurchasePrice: z.number(),
  purchaseCurrencyId: idSchema,
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
})
