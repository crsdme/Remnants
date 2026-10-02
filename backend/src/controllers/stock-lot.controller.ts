import type { NextFunction, Response } from 'express'
import type { GetStockLotsPayload, ValidatedAuthedRequest } from '@/types/'
import * as StockLedger from '@/services/stock-ledger.service'

export async function get(
  req: ValidatedAuthedRequest<GetStockLotsPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await StockLedger.listLots({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
