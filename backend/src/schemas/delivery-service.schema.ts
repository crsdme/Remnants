import { idSchema, languageStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const deliveryServiceDBSchema = z.object({
  _id: idSchema,
  names: languageStringSchema,
  type: z.enum(['novaposhta', 'selfpickup']),
  color: z.string(),
  priority: z.number(),
  active: z.boolean(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
