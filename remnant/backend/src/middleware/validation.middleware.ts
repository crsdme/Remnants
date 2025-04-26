import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { ZodSchema } from 'zod'

export function validateBodyRequest(schema: ZodSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      res.status(400).json({
        error: 'Invalid body data',
        details: result.error.format(),
      })

      return
    }

    req.body = result.data
    next()
  }
}

export function validateQueryRequest(schema: ZodSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)

    if (!result.success) {
      res.status(400).json({
        error: 'Invalid query data',
        details: result.error.format(),
      })

      return
    }

    req.body = result.data
    next()
  }
}

export function validateUpload(fieldName: string): RequestHandler {
  return (req, res, next) => {
    const file = req.file

    if (!file) {
      res.status(400).json({
        error: `Missing file: ${fieldName}`,
      })

      return
    }

    next()
  }
}
