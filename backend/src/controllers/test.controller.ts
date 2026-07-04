import type { NextFunction, Response } from 'express'
import type { ValidatedRequest } from '@/types'
import * as TestService from '@/services/test.service'

export async function start(
  req: ValidatedRequest<never, { key: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await TestService.start({ key: req.validated.body.key })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
