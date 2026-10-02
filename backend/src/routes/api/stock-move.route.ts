import type { RequestHandler } from 'express'
import { getStockMovesResponseSchema, getStockMovesSchema } from '@remnant/shared'
import { Router } from 'express'
import * as StockMoveController from '@/controllers/stock-move.controller'
import { checkPermissions, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getStockMovesSchema),
  checkPermissions('product.quantityLogs'),
  validateResponse(getStockMovesResponseSchema),
  StockMoveController.get as RequestHandler,
)

export default router
