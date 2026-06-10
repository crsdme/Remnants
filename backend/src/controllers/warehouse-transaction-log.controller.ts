import type { NextFunction, Response } from 'express'
import type { GetWarehouseTransactionLogsPayload, ValidatedRequest } from '@/types/'
import * as WarehouseTransactionLogService from '@/services/warehouse-transaction-log.service'

export async function get(
  req: ValidatedRequest<GetWarehouseTransactionLogsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await WarehouseTransactionLogService.get({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
