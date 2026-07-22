import { idSchema } from '@remnant/shared'
import { z } from 'zod'

export const settingDBSchema = z.object({
  _id: idSchema,
  key: z.string(),
  value: z.string(),
  scope: z.string(),
  isPublic: z.boolean(),
  description: z.string(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
