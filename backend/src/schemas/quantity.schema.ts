import { idSchema } from '@remnant/shared'
import { z } from 'zod'

export const quantityDBSchema = z.object({
  _id: idSchema,
  count: z.number(),
  productId: idSchema,
  warehouseId: idSchema,
  stockStatusId: idSchema.nullable().optional(),
  lastSaleAt: z.coerce.date().nullable().optional(),
  status: z.enum(['available', 'reserved', 'sold']).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
