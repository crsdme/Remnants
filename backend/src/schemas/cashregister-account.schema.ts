import { idSchema, languageStringSchema, numberFromStringSchema } from '@remnant/shared'
import { z } from 'zod'
import { currencyDBSchema } from './currency.schema'

export const cashregisterAccountDBSchema = z.object({
  _id: idSchema,
  seq: numberFromStringSchema,
  names: languageStringSchema,
  currencies: z.array(idSchema),
  priority: z.number(),
  active: z.boolean(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const cashregisterAccountDBPopulatedSchema = cashregisterAccountDBSchema.omit({
  currencies: true,
}).extend({
  currencies: z.array(currencyDBSchema),
})
