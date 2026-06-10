import type { RequestHandler } from 'express'
import {
  createWarehouseTransactionSchema,
  editWarehouseTransactionSchema,
  getWarehouseTransactionsItemsSchema,
  getWarehouseTransactionsSchema,
  receiveWarehouseTransactionSchema,
  removeWarehouseTransactionsSchema,
  scanBarcodeToDraftSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as WarehouseTransactionController from '@/controllers/warehouse-transaction.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getWarehouseTransactionsSchema),
  WarehouseTransactionController.get as RequestHandler,
)

router.get(
  '/get/items',
  validateQueryRequest(getWarehouseTransactionsItemsSchema),
  WarehouseTransactionController.getItems as RequestHandler,
)

router.get(
  '/scan/barcode',
  validateQueryRequest(scanBarcodeToDraftSchema),
  WarehouseTransactionController.scanBarcodeToDraft as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createWarehouseTransactionSchema),
  checkPermissions('warehouse-transaction.create'),
  WarehouseTransactionController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editWarehouseTransactionSchema),
  checkPermissions('warehouse-transaction.edit'),
  WarehouseTransactionController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeWarehouseTransactionsSchema),
  checkPermissions('warehouse-transaction.remove'),
  WarehouseTransactionController.remove as RequestHandler,
)

router.post(
  '/receive',
  validateBodyRequest(receiveWarehouseTransactionSchema),
  checkPermissions('warehouse-transaction.receive'),
  WarehouseTransactionController.receive as RequestHandler,
)

export default router
