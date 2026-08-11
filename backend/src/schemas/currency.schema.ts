import { idSchema, languageStringSchema, numberFromStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const currencyDBSchema = z.object({
  _id: idSchema,
  seq: numberFromStringSchema,
  names: languageStringSchema,
  symbols: languageStringSchema,
  scale: z.number(),
  paymentEpsilon: z.number().optional(),
  priority: z.number(),
  active: z.boolean(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const exchangeRateDBSchema = z.object({
  _id: idSchema,
  fromCurrencyId: idSchema,
  toCurrencyId: idSchema,
  rate: z.number(),
  comment: z.string(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
