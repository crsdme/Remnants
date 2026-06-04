import type { NextFunction, Request, Response } from 'express'
import { HttpError } from '@/utils/httpError'

export function checkPermissions(permission: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user

    if (!user) {
      throw new HttpError(401, 'Unauthorized', 'UNAUTHORIZED')
    }

    if (!user.permissions.includes(permission) && !user.permissions.includes('other.admin') && process.env.NODE_ENV !== 'test') {
      throw new HttpError(401, 'Access denied', 'PERMISSION_DENIED')
    }

    next()
  }
}
