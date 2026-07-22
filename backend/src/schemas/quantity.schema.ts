import { idSchema } from '@remnant/shared'
import { z } from 'zod'

export const quantityDBSchema = z.object({
  _id: idSchema,
  count: z.number(),
  productId: idSchema,
  warehouse: idSchema,
  status: z.enum(['available', 'reserved', 'sold']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
