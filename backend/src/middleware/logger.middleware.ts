import type { NextFunction, Request, Response } from 'express'
import logger from '@/utils/logger'

type AnyReq = Request<any, any, unknown, any>

export function requestLogger(req: AnyReq, res: Response, next: NextFunction) {
  res.on('finish', () => {
    const { method, originalUrl, body, ip } = req
    const { statusCode } = res

    const safeBody = sanitizeBody(body)

    const userId = req.user?.id ?? 'unknown'
    const message = `[${userId}] ${ip} ${method} ${originalUrl} ${statusCode} - Payload: ${JSON.stringify(safeBody)}`

    if (statusCode >= 500)
      logger.error(message)
    else if (statusCode >= 400)
      logger.warn(message)
    else logger.info(message)
  })

  next()
}

const sensitiveFields = ['password', 'token', 'refreshToken', 'accessToken', 'secret', 'apiKey'] as const

function sanitizeBody(body: unknown): Record<string, unknown> {
  if (!isPlainObject(body))
    return {}

  const sanitized: Record<string, unknown> = { ...body }

  for (const field of sensitiveFields) {
    if (field in sanitized)
      sanitized[field] = '***'
  }

  return sanitized
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
