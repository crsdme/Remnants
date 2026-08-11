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

/** HTTP body from POST /auth/login (`res.json({ user })`) */
export const loginResponseSchema = z.object({
  user: z.object({
    id: idSchema,
    login: z.string(),
    name: z.string(),
    permissions: z.array(z.string()),
    settings: z.array(z.object({
      key: z.string(),
      value: z.string(),
    })),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
})

/** HTTP body from POST /auth/logout */
export const logoutResponseSchema = z.object({
  message: z.string(),
})

/** HTTP body from POST /auth/refresh */
export const refreshResponseSchema = z.object({
  status: z.literal('success'),
  permissions: z.array(z.string()),
})
