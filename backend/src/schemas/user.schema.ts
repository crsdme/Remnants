import { idSchema, numberFromStringSchema } from '@remnant/shared'
import { z } from 'zod'
import { userRoleDBSchema } from './user-role.schema'

export const userDBSchema = z.object({
  _id: idSchema,
  seq: numberFromStringSchema,
  login: z.string(),
  password: z.string(),
  name: z.string(),
  role: idSchema,
  active: z.boolean(),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const userPopulatedDBSchema = z.object({
  _id: idSchema,
  seq: numberFromStringSchema,
  name: z.string(),
  login: z.string(),
  role: userRoleDBSchema.omit({ seq: true, removed: true }),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
