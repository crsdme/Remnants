import { idSchema } from '@remnant/shared'
import { z } from 'zod'

export const userAccessDBSchema = z.object({
  _id: idSchema,
  userId: idSchema,
  warehouses: z.array(idSchema).default([]),
  sites: z.array(idSchema).default([]),
  expenseCategories: z.array(idSchema).default([]),
  cashregisters: z.array(idSchema).default([]),
  cashregisterAccounts: z.array(idSchema).default([]),
  deliveryServices: z.array(idSchema).default([]),
  orderSources: z.array(idSchema).default([]),
  orderStatuses: z.array(idSchema).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
