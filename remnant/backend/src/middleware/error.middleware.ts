import type { NextFunction, Request, Response } from 'express'
import logger from '../utils/logger'

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  logger.error(err)

  if (res.headersSent) {
    return next(err)
  }

  const statusCode = err.statusCode || 500

  const errorResponse = {
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  }

  res.status(statusCode).json(errorResponse)
}
