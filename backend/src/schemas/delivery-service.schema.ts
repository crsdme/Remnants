import { deliveryCarrierTypeSchema, deliveryServiceCredentialsSchema, idSchema, languageStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const deliveryServiceDBSchema = z.object({
  _id: idSchema,
  names: languageStringSchema,
  type: deliveryCarrierTypeSchema,
  color: z.string(),
  priority: z.number(),
  active: z.boolean(),
  credentials: deliveryServiceCredentialsSchema.optional(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
