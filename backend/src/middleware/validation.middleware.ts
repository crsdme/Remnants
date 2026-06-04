import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { z, ZodTypeAny } from 'zod'
import type { ValidatedRequest } from '@/types'
import { parseFormData } from '@/utils/parseTools'

export function validateBodyRequest<TSchema extends ZodTypeAny>(
  schema: TSchema,
  options?: { formData?: boolean },
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    let body: unknown = req.body

    if (options?.formData) {
      body = parseFormData(req.body as Record<string, unknown>)
    }

    const result = schema.safeParse(body)

    if (!result.success) {
      res.status(400).json({ error: 'Invalid body data', details: result.error.format() })
      return
    }

    const typedReq = req as ValidatedRequest<unknown, z.output<TSchema>>

    req.body = result.data as z.output<TSchema>
    typedReq.validated = {
      query: typedReq.validated?.query ?? req.query,
      body: result.data as z.output<TSchema>,
      params: typedReq.validated?.params ?? req.params,
    }
    next()
  }
}

export function validateQueryRequest<TSchema extends ZodTypeAny>(schema: TSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)

    if (!result.success) {
      return res.status(400).json({ error: 'Invalid query data', details: result.error.format() })
    }

    const typedReq = req as ValidatedRequest<z.output<TSchema>>
    typedReq.validated
      = typedReq.validated ?? {
        query: req.query as unknown as z.output<TSchema>,
        body: req.body,
        params: req.params as unknown as z.output<TSchema>,
      }

    typedReq.validated.query = result.data as z.output<TSchema>
    next()
  }
}

export function validateParamsRequest<TSchema extends ZodTypeAny>(
  schema: TSchema,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params)

    if (!result.success) {
      res.status(400).json({ error: 'Invalid params data', details: result.error.format() })
      return
    }

    const typedReq = req as ValidatedRequest<unknown, unknown, z.output<TSchema>>

    req.params = result.data as unknown as typeof req.params
    typedReq.validated = {
      query: typedReq.validated?.query ?? req.query,
      body: typedReq.validated?.body ?? req.body,
      params: result.data as z.output<TSchema>,
    }
    next()
  }
}

export function validateUpload(fieldName: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const file = req.file

    if (!file) {
      res.status(400).json({ error: `Missing file: ${fieldName}` })
      return
    }

    next()
  }
}
