import { Router } from 'express'
import * as WarehouseTransactionLogController from '../../controllers/warehouse-transaction-log.controller'
import { validateQueryRequest } from '../../middleware'
import { getWarehouseTransactionLogsSchema } from '../../schemas/warehouse-transaction-log.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getWarehouseTransactionLogsSchema),
  WarehouseTransactionLogController.get,
)

export default router
