import {
  cashregisterAccessEntrySchema,
  idSchema,
  warehouseAccessEntrySchema,
} from '@remnant/shared'
import { z } from 'zod'

export const userAccessDBSchema = z.object({
  _id: idSchema,
  userId: idSchema,
  warehouses: z.array(warehouseAccessEntrySchema).default([]),
  cashregisters: z.array(cashregisterAccessEntrySchema).default([]),
  siteIds: z.array(idSchema).default([]),
  expenseCategoryIds: z.array(idSchema).default([]),
  cashregisterAccountIds: z.array(idSchema).default([]),
  deliveryServiceIds: z.array(idSchema).default([]),
  orderSourceIds: z.array(idSchema).default([]),
  orderStatusIds: z.array(idSchema).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
