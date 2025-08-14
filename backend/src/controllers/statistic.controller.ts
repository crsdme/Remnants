import type { NextFunction, Request, Response } from 'express'
import * as StatisticService from '../services/statistic.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await StatisticService.get(req.query)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
