import { idSchema, languageStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const orderSourceDBSchema = z.object({
  _id: idSchema,
  names: languageStringSchema,
  priority: z.number(),
  color: z.string(),
  removed: z.boolean().default(false),
  createdBy: idSchema,
  removedBy: idSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
