import type { NextFunction, Request, Response } from 'express'
import * as TestService from '../services/test.service'

export async function start(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await TestService.start(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
