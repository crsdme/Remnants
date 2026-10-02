import { idSchema, idSchemaOptional, minorNumberSchema } from '@remnant/shared'
import { z } from 'zod'

export const paymentApplicationDBSchema = z.object({
  _id: idSchema,
  seq: z.number().optional().default(0),
  partyType: z.enum(['client', 'supplier']),
  partyId: idSchema,
  documentType: z.enum(['order', 'procurement']),
  documentId: idSchema,
  moneyTransactionId: idSchema,
  currencyId: idSchema,
  minorAmount: minorNumberSchema,
  comment: z.string().optional(),
  cancelled: z.boolean().optional(),
  cancelledBy: idSchemaOptional,
  cancelledAt: z.coerce.date().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
