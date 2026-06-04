import type { NextFunction, Request, Response } from 'express'
import { authUserSchema } from '@remnant/shared'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'secret'

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const { accessToken } = req.cookies

  if (typeof accessToken !== 'string' || accessToken.length === 0)
    return res.sendStatus(401)

  jwt.verify(accessToken, JWT_SECRET, (err, decoded) => {
    if (err || typeof decoded !== 'object' || decoded === null)
      return res.sendStatus(401)
    if (typeof decoded === 'string')
      return res.sendStatus(401)

    const parsed = authUserSchema.safeParse(decoded)
    if (!parsed.success)
      return res.sendStatus(401)

    req.user = parsed.data
    next()
  })
}

export function refreshJWT(req: Request, res: Response, next: NextFunction) {
  const { refreshToken } = req.cookies
  if (typeof refreshToken !== 'string' || refreshToken.length === 0)
    return res.sendStatus(403)

  jwt.verify(refreshToken, JWT_SECRET, (err) => {
    if (err)
      return res.sendStatus(403)
    next()
  })
}

export function fakeAuthenticateJWT(req: Request, _res: Response, next: NextFunction) {
  req.user = {
    id: 'test-user-id',
    login: 'test-user-login',
    name: 'test-user-name',
    role: 'test-user-role',
    permissions: ['test-permission'],
  }
  next()
}

export function authMiddleware() {
  return process.env.NODE_ENV === 'test' ? fakeAuthenticateJWT : authenticateJWT
}
