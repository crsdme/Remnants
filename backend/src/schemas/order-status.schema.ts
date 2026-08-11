import { idSchema, languageStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const orderStatusDBSchema = z.object({
  _id: idSchema,
  names: languageStringSchema,
  priority: z.number(),
  color: z.string(),
  removed: z.boolean().default(false),
  isLocked: z.boolean(),
  isSelectable: z.boolean(),
  isDisplayed: z.boolean().default(true),
  includeInStatistics: z.boolean().default(true),
  createdBy: idSchema,
  removedBy: idSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
