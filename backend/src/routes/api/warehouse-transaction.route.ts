import { createWarehouseTransactionSchema, editWarehouseTransactionSchema, getWarehouseTransactionsItemsSchema, getWarehouseTransactionsSchema, receiveWarehouseTransactionSchema, removeWarehouseTransactionsSchema, scanBarcodeToDraftSchema } from '@remnant/shared'
import { Router } from 'express'
import * as WarehouseTransactionController from '@/controllers/warehouse-transaction.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getWarehouseTransactionsSchema),
  WarehouseTransactionController.get,
)

router.get(
  '/get/items',
  validateQueryRequest(getWarehouseTransactionsItemsSchema),
  WarehouseTransactionController.getItems,
)

router.get(
  '/scan/barcode',
  validateQueryRequest(scanBarcodeToDraftSchema),
  WarehouseTransactionController.scanBarcodeToDraft,
)

router.post(
  '/create',
  validateBodyRequest(createWarehouseTransactionSchema),
  checkPermissions('warehouse-transaction.create'),
  WarehouseTransactionController.create,
)

router.post(
  '/edit',
  validateBodyRequest(editWarehouseTransactionSchema),
  checkPermissions('warehouse-transaction.edit'),
  WarehouseTransactionController.edit,
)

router.post(
  '/remove',
  validateBodyRequest(removeWarehouseTransactionsSchema),
  checkPermissions('warehouse-transaction.remove'),
  WarehouseTransactionController.remove,
)

router.post(
  '/receive',
  validateBodyRequest(receiveWarehouseTransactionSchema),
  checkPermissions('warehouse-transaction.receive'),
  WarehouseTransactionController.receive,
)

export default router
