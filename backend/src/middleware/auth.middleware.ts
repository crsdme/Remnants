import type { NextFunction, Request, Response } from 'express'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  // const authHeader = req.headers.authorization;
  const authHeader = req.cookies.accessToken

  if (authHeader) {
    // const token = authHeader.split(" ")[1];
    const token = authHeader

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.sendStatus(401)
      }

      (req as any).user = decoded
      next()
    })
  }
  else {
    res.sendStatus(401)
  }
}

export function refreshJWT(req: Request, res: Response, next: NextFunction) {
  jwt.verify(req.cookies.refreshToken, JWT_SECRET, (err: any) => {
    if (err)
      return res.sendStatus(403)
    next()
  })
}

export function fakeAuthenticateJWT(req: Request, res: Response, next: NextFunction) {
  (req as any).user = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'admin',
  }

  next()
}

export function getAuthMiddleware() {
  if (process.env.NODE_ENV === 'test')
    return fakeAuthenticateJWT

  return authenticateJWT
}
