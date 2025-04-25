import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const getCategorySchema = z.object({
  filters: z.object({
    names: z.string(),
    language: z.string(),
    flat: z.preprocess(val => Boolean(val), z.boolean()),
  }),
  pagination: z.object({
    current: z.preprocess(val => Number(val), z.number()),
    pageSize: z.preprocess(val => Number(val), z.number()),
  }),
})

export function validateGetCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const result = getCategorySchema.safeParse(req.query)
    req.body = result.data

    next()
  }
  catch (error) {
    res.status(400).json({ error: 'Invalid get category data' })
  }
}
