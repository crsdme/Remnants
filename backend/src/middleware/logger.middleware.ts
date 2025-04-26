import type { NextFunction, Request, Response } from 'express'
import type { JwtPayload } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'
import logger from '../utils/logger'

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  res.on('finish', () => {
    const { method, originalUrl, body, ip } = req
    const { statusCode } = res

    const safeBody = sanitizeBody(body)

    const userId = (req as any).user?.id || undefined
    const decodedToken = jwt.decode(userId) as JwtPayload | null
    const userIdFromToken = decodedToken?.id || 'unknown'

    const message = `[${userIdFromToken}] ${ip} ${method} ${originalUrl} ${statusCode} - Payload: ${JSON.stringify(safeBody)}`

    if (statusCode >= 500) {
      logger.error(message)
    }
    else if (statusCode >= 400) {
      logger.warn(message)
    }
    else {
      logger.info(message)
    }
  })

  next()
}

const sensitiveFields = ['password', 'token', 'refreshToken', 'accessToken', 'secret', 'apiKey']

function sanitizeBody(body: Record<string, any>): Record<string, any> {
  if (!body || typeof body !== 'object') {
    return {}
  }

  const sanitized = { ...body }

  for (const field of sensitiveFields) {
    if (sanitized[field] !== undefined) {
      sanitized[field] = '***'
    }
  }

  return sanitized
}
