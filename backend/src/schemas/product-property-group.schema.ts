import { idSchema, languageStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const productPropertyGroupDBSchema = z.object({
  _id: idSchema,
  names: languageStringSchema,
  productProperties: z.array(idSchema),
  priority: z.number(),
  active: z.boolean(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
