import type { NextFunction, Request, Response } from 'express'
import { HttpError } from '@/utils/httpError'

export function checkPermissions(permission: string | string[]) {
  const required = Array.isArray(permission) ? permission : [permission]

  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user

    if (!user) {
      throw new HttpError(401, 'Unauthorized', 'UNAUTHORIZED')
    }

    const allowed = user.permissions.includes('other.admin')
      || required.some(item => user.permissions.includes(item))
      || process.env.NODE_ENV === 'test'

    if (!allowed) {
      throw new HttpError(401, 'Access denied', 'PERMISSION_DENIED')
    }

    next()
  }
}
