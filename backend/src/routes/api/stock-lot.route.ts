import type { RequestHandler } from 'express'
import { getStockLotsResponseSchema, getStockLotsSchema } from '@remnant/shared'
import { Router } from 'express'
import * as StockLotController from '@/controllers/stock-lot.controller'
import { checkPermissions, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getStockLotsSchema),
  checkPermissions('product.quantityLogs'),
  validateResponse(getStockLotsResponseSchema),
  StockLotController.get as RequestHandler,
)

export default router
