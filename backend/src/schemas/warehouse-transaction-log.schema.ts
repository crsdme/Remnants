import { idSchema } from '@remnant/shared'
import { z } from 'zod'

export const warehouseTransactionLogDBSchema = z.object({
  _id: idSchema,
  productId: idSchema,
  warehouseId: idSchema,
  deltaCount: z.number(),
  previousCount: z.number().optional(),
  afterCount: z.number().optional(),
  refType: z.string(),
  refId: idSchema,
  userId: idSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
