import type { RequestHandler } from 'express'
import {
  createWarehouseTransactionResponseSchema,
  createWarehouseTransactionSchema,
  editWarehouseTransactionResponseSchema,
  editWarehouseTransactionSchema,
  getWarehouseTransactionDetailsResponseSchema,
  getWarehouseTransactionDetailsSchema,
  getWarehouseTransactionsItemsResponseSchema,
  getWarehouseTransactionsItemsSchema,
  getWarehouseTransactionsResponseSchema,
  getWarehouseTransactionsSchema,
  receiveWarehouseTransactionResponseSchema,
  receiveWarehouseTransactionSchema,
  removeWarehouseTransactionsResponseSchema,
  removeWarehouseTransactionsSchema,
  scanBarcodeToDraftResponseSchema,
  scanBarcodeToDraftSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as WarehouseTransactionController from '@/controllers/warehouse-transaction.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getWarehouseTransactionsSchema),
  validateResponse(getWarehouseTransactionsResponseSchema),
  WarehouseTransactionController.get as RequestHandler,
)

router.get(
  '/get/items',
  validateQueryRequest(getWarehouseTransactionsItemsSchema),
  validateResponse(getWarehouseTransactionsItemsResponseSchema),
  WarehouseTransactionController.getItems as RequestHandler,
)

router.get(
  '/get/details',
  validateQueryRequest(getWarehouseTransactionDetailsSchema),
  validateResponse(getWarehouseTransactionDetailsResponseSchema),
  WarehouseTransactionController.getDetails as RequestHandler,
)

router.get(
  '/scan/barcode',
  validateQueryRequest(scanBarcodeToDraftSchema),
  validateResponse(scanBarcodeToDraftResponseSchema),
  WarehouseTransactionController.scanBarcodeToDraft as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createWarehouseTransactionSchema),
  checkPermissions('warehouseTransaction.create'),
  validateResponse(createWarehouseTransactionResponseSchema),
  WarehouseTransactionController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editWarehouseTransactionSchema),
  checkPermissions('warehouseTransaction.edit'),
  validateResponse(editWarehouseTransactionResponseSchema),
  WarehouseTransactionController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeWarehouseTransactionsSchema),
  checkPermissions('warehouseTransaction.remove'),
  validateResponse(removeWarehouseTransactionsResponseSchema),
  WarehouseTransactionController.remove as RequestHandler,
)

router.post(
  '/receive',
  validateBodyRequest(receiveWarehouseTransactionSchema),
  checkPermissions('warehouseTransaction.receive'),
  validateResponse(receiveWarehouseTransactionResponseSchema),
  WarehouseTransactionController.receive as RequestHandler,
)

export default router
