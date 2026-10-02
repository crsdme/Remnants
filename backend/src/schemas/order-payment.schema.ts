import { idSchema, idSchemaOptional, languageStringSchema, minorSchema, numberFromStringSchema } from '@remnant/shared'
import { z } from 'zod'

/** Projection of payment-application (+ money-tx) used as order payment lines. */
export const orderPaymentDBPopulatedSchema = z.object({
  _id: idSchema,
  orderId: idSchema,
  cashregister: z.object({
    id: idSchema,
    names: languageStringSchema,
  }),
  cashregisterAccount: z.object({
    id: idSchema,
    names: languageStringSchema,
  }),
  minorAmount: minorSchema,
  currency: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: numberFromStringSchema,
  }),
  paymentDate: z.coerce.date(),
  transactionId: idSchemaOptional,
  comment: z.string().optional(),
  createdBy: idSchemaOptional,
  removedBy: idSchemaOptional,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
