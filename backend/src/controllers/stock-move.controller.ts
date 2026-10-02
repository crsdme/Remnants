import type { NextFunction, Response } from 'express'
import type { GetStockMovesPayload, ValidatedAuthedRequest } from '@/types/'
import * as StockLedger from '@/services/stock-ledger.service'

export async function get(
  req: ValidatedAuthedRequest<GetStockMovesPayload, never>,
  res: Response,
  next: NextFunction,
) {
  try {
    const serviceResponse = await StockLedger.listMoves({
      payload: req.validated.query,
    })

    res.status(200).json(serviceResponse)
  }
  catch (err) {
    next(err)
  }
}
