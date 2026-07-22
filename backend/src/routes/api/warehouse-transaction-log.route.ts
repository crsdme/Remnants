import type { RequestHandler } from 'express'
import { getWarehouseTransactionLogsSchema } from '@remnant/shared'
import { Router } from 'express'
import * as WarehouseTransactionLogController from '@/controllers/warehouse-transaction-log.controller'
import { validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getWarehouseTransactionLogsSchema),
  WarehouseTransactionLogController.get as RequestHandler,
)

export default router
