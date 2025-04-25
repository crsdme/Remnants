import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const getLanguageSchema = z.object({
  pagination: z.object({
    full: z.preprocess(val => Boolean(val), z.boolean()),
    current: z.preprocess(val => Number(val), z.number()).optional(),
    pageSize: z.preprocess(val => Number(val), z.number()).optional(),
  }),
})

export function validateGetLanguage(req: Request, res: Response, next: NextFunction) {
  try {
    const result = getLanguageSchema.safeParse(req.query)
    req.body = result.data
    next()
  }
  catch (error) {
    res.status(400).json({ error: 'Invalid get language data' })
  }
}
