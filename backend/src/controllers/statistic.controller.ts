import type { GetOrderStatisticRequest } from '@remnant/shared'
import type { NextFunction, Response } from 'express'
import type { ValidatedAuthedRequest } from '@/types'
import * as StatisticService from '@/services/statistic.service'

export async function get(
  req: ValidatedAuthedRequest<GetOrderStatisticRequest, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await StatisticService.get({
      payload: req.validated.query,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
