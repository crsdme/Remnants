import { idSchema, languageStringSchema, numberFromStringSchema } from '@remnant/shared'
import { z } from 'zod'
import { cashregisterAccountDBPopulatedSchema } from './cashregister-account.schema'

export const cashregisterDBSchema = z.object({
  _id: idSchema,
  seq: numberFromStringSchema,
  names: languageStringSchema,
  accounts: z.array(idSchema),
  priority: z.number(),
  active: z.boolean(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const cashregisterDBPopulatedSchema = cashregisterDBSchema.omit({
  accounts: true,
}).extend({
  accounts: z.array(cashregisterAccountDBPopulatedSchema),
})
