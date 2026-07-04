import type { NextFunction, Request, Response } from 'express'
import type { HttpError } from '@/utils/httpError'
import { getErrorSourceFromStack } from '@/utils/errorSource'
import logger from '@/utils/logger'

export function errorHandler(err: HttpError, req: Request, res: Response, next: NextFunction): void {
  // Log a plain object: winston colorize assigns to `info.message`, which throws if `info` is an Error
  // (or similar) whose `message` is getter-only.
  const errorSource = getErrorSourceFromStack(err.stack)

  logger.error({
    message: err.message ?? 'Internal Server Error',
    code: err.code,
    statusCode: err.statusCode,
    description: err.description,
    source: errorSource ? `${errorSource.file}:${errorSource.line}` : undefined,
    sourceLine: errorSource?.source,
    stack: err.stack,
  })

  if (res.headersSent)
    return next(err)

  const errorResponse = {
    error: {
      code: err.code ?? 'INTERNAL_ERROR',
      message: err.message ?? 'Internal Server Error',
      description: err.description ?? '',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  }

  res.status(err.statusCode ?? 500).json(errorResponse)
}
