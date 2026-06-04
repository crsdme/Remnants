import type { NextFunction, Request, Response } from 'express'
import * as WarehouseTransactionLogService from '@/services/warehouse-transaction-log.service'

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceResponse = await WarehouseTransactionLogService.get(req.body)

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
