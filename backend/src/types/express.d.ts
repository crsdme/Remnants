import type { AuthUser } from '@remnant/shared'
import 'express'

declare global {
  namespace Express {
    interface Request {
      validated?: {
        query?: unknown
        body?: unknown
        params?: unknown
      }
      user?: AuthUser
      cookies?: {
        refreshToken?: string
        accessToken?: string
      }
    }
  }
}

export { }
