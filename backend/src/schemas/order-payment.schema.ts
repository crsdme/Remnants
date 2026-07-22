import { idSchema, idSchemaOptional, languageStringSchema, minorSchema, numberFromStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const orderPaymentDBSchema = z.object({
  _id: idSchema,
  orderId: idSchema,
  cashregisterId: idSchema,
  cashregisterAccountId: idSchema,
  minorAmount: minorSchema,
  currencyId: idSchema,
  paymentStatus: z.string(),
  paymentDate: z.coerce.date(),
  transactionId: idSchema,
  comment: z.string(),
  createdBy: idSchema,
  removedBy: idSchema,
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const orderPaymentDBPopulatedSchema = orderPaymentDBSchema.omit({
  currencyId: true,
}).extend({
  currency: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: numberFromStringSchema,
  }),
})

export const orderPaymentPopulatedRepoItemSchema = z.object({
  id: idSchema,
  order: idSchema,
  cashregister: idSchema,
  cashregisterAccount: idSchema,
  minorAmount: minorSchema,
  currency: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: numberFromStringSchema,
    paymentEpsilon: numberFromStringSchema.optional(),
  }),
  paymentStatus: z.string(),
  paymentDate: z.coerce.date(),
  transaction: idSchema,
  comment: z.string().optional(),
  createdBy: idSchema,
  removedBy: idSchemaOptional,
  removed: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const createOrderPaymentRepoSchema = z.object({
  orderId: idSchema,
  cashregisterId: idSchema,
  cashregisterAccountId: idSchema,
  minorAmount: minorSchema,
  currencyId: idSchema,
  paymentStatus: z.string(),
  paymentDate: z.coerce.date().optional(),
  comment: z.string().optional(),
  createdBy: idSchemaOptional,
})

export const editOrderPaymentRepoSchema = z.object({
  orderId: idSchemaOptional,
  cashregisterId: idSchemaOptional,
  cashregisterAccountId: idSchemaOptional,
  minorAmount: minorSchema.optional(),
  currencyId: idSchemaOptional,
  paymentStatus: z.string().optional(),
  paymentDate: z.coerce.date().optional(),
  comment: z.string().optional(),
  removed: z.boolean().optional(),
  removedBy: idSchemaOptional,
})
