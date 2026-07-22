import { z } from 'zod'
import { idSchema } from './common'

export const loginSchema = z.object({
  login: z.string(),
  password: z.string(),
})

export type LoginRequest = z.infer<typeof loginSchema>

export const refreshSchema = z.object({ refreshToken: z.string() })

export const tokenSchema = z.object({
  id: idSchema,
  login: z.string(),
  permissions: z.array(z.string()),
})

export const authUserSchema = z.object({
  id: idSchema,
  login: z.string(),
  // name: z.string(),
  // role: z.string(),
  permissions: z.array(z.string()),
})

export type AuthUser = z.infer<typeof authUserSchema>
