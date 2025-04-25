import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const getUnitSchema = z.object({
  pagination: z.object({
    current: z.preprocess(val => Number(val), z.number()).optional(),
    pageSize: z.preprocess(val => Number(val), z.number()).optional(),
  }),
})

export function validateGetUnits(req: Request, res: Response, next: NextFunction) {
  try {
    const result = getUnitSchema.safeParse(req.query)
    req.body = result.data
    next()
  }
  catch (error) {
    res.status(400).json({ error: 'Invalid get language data' })
  }
}
