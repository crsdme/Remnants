import { idSchema } from '@remnant/shared'
import { z } from 'zod'

export const supplierDBSchema = z.object({
  _id: idSchema,
  seq: z.number().optional().default(0),
  name: z.string(),
  emails: z.array(z.string()),
  phones: z.array(z.string()),
  socials: z.array(z.object({
    type: z.string(),
    value: z.string(),
  })),
  comment: z.string(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
