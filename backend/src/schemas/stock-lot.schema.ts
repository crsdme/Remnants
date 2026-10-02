import { idSchema } from '@remnant/shared'
import { z } from 'zod'

export const stockLotDBSchema = z.object({
  _id: idSchema,
  productId: idSchema,
  warehouseId: idSchema,
  originalCount: z.number().int(),
  remainingCount: z.number().int(),
  minorUnitCost: z.number(),
  currencyId: idSchema,
  receivedAt: z.coerce.date(),
  sourceMoveId: idSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
