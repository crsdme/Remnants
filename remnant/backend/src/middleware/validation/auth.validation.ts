import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import logger from '../../utils/logger'

const loginSchema = z.object({
  login: z.string(),
  password: z.string(),
  type: z.string(),
})

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  try {
    loginSchema.parse(req.body)
    next()
  }
  catch (error) {
    logger.error(error)
    res.status(400).json({ error: 'Invalid login data' })
  }
}
