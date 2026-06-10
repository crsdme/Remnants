import { idSchema } from '@remnant/shared'
import { z } from 'zod'

export const editWarehouseTransactionRepoSchema = z.object({
  comment: z.string().trim().optional(),
  accepted: z.boolean().optional(),
  acceptedBy: idSchema.optional(),
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
