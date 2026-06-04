import type { IdType } from '@remnant/shared'
import type { JwtPayload } from 'jsonwebtoken'
import type { z } from 'zod'
import {
  loginSchema,
} from '@remnant/shared'

export type LoginPayload = z.output<typeof loginSchema>
export function parseLogin(x: unknown): LoginPayload {
  return loginSchema.parse(x)
}

export interface RefreshPayload {
  refreshToken: string
}

export interface TokenPayload extends JwtPayload {
  id: IdType
  login: string
  permissions: string[]
}

export interface auntificatedUser {
  id: string
  login: string
  permissions: string[]
}
