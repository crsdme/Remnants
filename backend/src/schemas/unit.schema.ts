import { idSchema, languageStringSchema, numberFromStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const unitDBSchema = z.object({
  _id: idSchema,
  seq: numberFromStringSchema,
  names: languageStringSchema,
  symbols: languageStringSchema,
  priority: z.number(),
  active: z.boolean(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
