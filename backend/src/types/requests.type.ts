import type { AuthUser } from '@remnant/shared'
import type { Request } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'

export type ValidatedRequest<
  Q = unknown,
  B = unknown,
  P extends ParamsDictionary = ParamsDictionary,
> = Request<P, any, any, any> & {
  validated: {
    query: Q
    body: B
    params: P
  }
  user?: AuthUser
  cookies?: {
    refreshToken?: string
    accessToken?: string
  }
}

export type ValidatedAuthedRequest<
  Q = unknown,
  B = unknown,
  P extends ParamsDictionary = ParamsDictionary,
> = ValidatedRequest<Q, B, P> & { user: AuthUser } & { cookies: { refreshToken: string, accessToken: string } }
