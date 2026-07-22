import { idSchema, numberFromStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const clientDBSchema = z.object({
  _id: idSchema,
  seq: numberFromStringSchema,
  name: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  emails: z.array(z.string()),
  phones: z.array(z.string()),
  addresses: z.array(z.string()),
  socials: z.array(z.object({
    type: z.string(),
    value: z.string(),
  })),
  country: z.string(),
  comment: z.string(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
