import { idSchema, languageStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const siteDBSchema = z.object({
  _id: idSchema,
  names: languageStringSchema,
  url: z.string(),
  key: z.string(),
  priority: z.number(),
  active: z.boolean(),
  warehouseIds: z.array(idSchema),
  currencyId: idSchema.nullable().optional(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
