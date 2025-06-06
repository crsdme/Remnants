import type { NextFunction, Request, Response } from 'express'
import { HttpError } from '../utils/httpError'

export function checkPermissions(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user

    if (!user?.permissions?.includes(permission) && !user?.permissions?.includes('other.admin')) {
      throw new HttpError(401, 'Access denied', 'PERMISSION_DENIED')
    }

    next()
  }
}
