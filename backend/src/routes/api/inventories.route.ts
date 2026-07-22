import type { RequestHandler } from 'express'
import { createInventorySchema, editInventorySchema, getInventoriesSchema, getInventoryItemsSchema, removeInventoriesSchema, scanBarcodeToDraftsSchema } from '@remnant/shared'
import { Router } from 'express'
import * as InventoriesController from '@/controllers/inventories.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getInventoriesSchema),
  InventoriesController.get as RequestHandler,
)

router.get(
  '/get/items',
  validateQueryRequest(getInventoryItemsSchema),
  InventoriesController.getItems as RequestHandler,
)

router.get(
  '/scan/barcode',
  validateQueryRequest(scanBarcodeToDraftsSchema),
  InventoriesController.scanBarcodeToDraft as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createInventorySchema),
  checkPermissions('inventories.create'),
  InventoriesController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editInventorySchema),
  checkPermissions('inventories.edit'),
  InventoriesController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeInventoriesSchema),
  checkPermissions('inventories.remove'),
  InventoriesController.remove as RequestHandler,
)

export default router
