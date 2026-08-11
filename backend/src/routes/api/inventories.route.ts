import type { RequestHandler } from 'express'
import {
  confirmInventoryResponseSchema,
  confirmInventorySchema,
  createInventoryResponseSchema,
  createInventorySchema,
  editInventoryResponseSchema,
  editInventorySchema,
  exportInventorySchema,
  getInventoriesResponseSchema,
  getInventoriesSchema,
  getInventoryItemsResponseSchema,
  getInventoryItemsSchema,
  getInventoryProgressResponseSchema,
  getInventoryProgressSchema,
  removeInventoriesResponseSchema,
  removeInventoriesSchema,
  scanBarcodeToDraftInventoryResponseSchema,
  scanBarcodeToDraftsSchema,
  upsertInventoryItemResponseSchema,
  upsertInventoryItemSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as InventoriesController from '@/controllers/inventories.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getInventoriesSchema),
  validateResponse(getInventoriesResponseSchema),
  InventoriesController.get as RequestHandler,
)

router.get(
  '/get/items',
  validateQueryRequest(getInventoryItemsSchema),
  validateResponse(getInventoryItemsResponseSchema),
  InventoriesController.getItems as RequestHandler,
)

router.get(
  '/get/progress',
  validateQueryRequest(getInventoryProgressSchema),
  validateResponse(getInventoryProgressResponseSchema),
  InventoriesController.getProgress as RequestHandler,
)

router.get(
  '/scan/barcode',
  validateQueryRequest(scanBarcodeToDraftsSchema),
  validateResponse(scanBarcodeToDraftInventoryResponseSchema),
  InventoriesController.scanBarcodeToDraft as RequestHandler,
)

router.post(
  '/export',
  validateBodyRequest(exportInventorySchema),
  InventoriesController.exportExcel as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createInventorySchema),
  checkPermissions('inventory.create'),
  validateResponse(createInventoryResponseSchema),
  InventoriesController.create as RequestHandler,
)

router.post(
  '/upsert-item',
  validateBodyRequest(upsertInventoryItemSchema),
  checkPermissions('inventory.edit'),
  validateResponse(upsertInventoryItemResponseSchema),
  InventoriesController.upsertItem as RequestHandler,
)

router.post(
  '/confirm',
  validateBodyRequest(confirmInventorySchema),
  checkPermissions('inventory.edit'),
  validateResponse(confirmInventoryResponseSchema),
  InventoriesController.confirm as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editInventorySchema),
  checkPermissions('inventory.edit'),
  validateResponse(editInventoryResponseSchema),
  InventoriesController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeInventoriesSchema),
  checkPermissions('inventory.remove'),
  validateResponse(removeInventoriesResponseSchema),
  InventoriesController.remove as RequestHandler,
)

export default router
