import { idSchema, languageStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const expenseCategoryDBSchema = z.object({
  _id: idSchema,
  names: languageStringSchema,
  color: z.string(),
  comment: z.string(),
  priority: z.number(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
