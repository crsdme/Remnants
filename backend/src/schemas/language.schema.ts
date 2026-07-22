import { idSchema, numberFromStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const languageDBSchema = z.object({
  _id: idSchema,
  seq: numberFromStringSchema,
  name: z.string(),
  code: z.string(),
  main: z.boolean(),
  priority: z.number(),
  active: z.boolean(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
