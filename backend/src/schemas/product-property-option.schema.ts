import { idSchema, languageStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const productPropertyOptionDBSchema = z.object({
  _id: idSchema,
  names: languageStringSchema,
  productPropertyId: idSchema,
  priority: z.number(),
  active: z.boolean(),
  color: z.string(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
