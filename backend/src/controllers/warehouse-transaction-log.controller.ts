import type { NextFunction, Response } from 'express'
import type { GetWarehouseTransactionLogsPayload, ValidatedAuthedRequest } from '@/types/'
import * as WarehouseTransactionLogService from '@/services/warehouse-transaction-log.service'

export async function get(
  req: ValidatedAuthedRequest<GetWarehouseTransactionLogsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await WarehouseTransactionLogService.get({
      payload: req.validated.query,
      user: req.user,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
