import { idSchema, languageStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const userRoleDBSchema = z.object({
  _id: idSchema,
  names: languageStringSchema,
  permissions: z.array(z.string()),
  priority: z.number(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const userPopulatedDBSchema = z.object({
  _id: idSchema,
  seq: z.number(),
  name: z.string(),
  login: z.string(),
  role: userRoleDBSchema,
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
