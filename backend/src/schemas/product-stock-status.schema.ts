import { idSchema, languageStringSchema, productStockStatusConditionSchema } from '@remnant/shared'
import { z } from 'zod'

export const productStockStatusDBSchema = z.object({
  _id: idSchema,
  names: languageStringSchema,
  priority: z.number(),
  color: z.string(),
  active: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  conditions: z.array(productStockStatusConditionSchema).default([]),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
