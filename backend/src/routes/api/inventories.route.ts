import { createInventorySchema, editInventorySchema, getInventoriesSchema, getInventoryItemsSchema, removeInventoriesSchema, scanBarcodeToDraftSchema } from '@remnant/shared'
import { Router } from 'express'
import * as InventoriesController from '@/controllers/inventories.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getInventoriesSchema),
  InventoriesController.get,
)

router.get(
  '/get/items',
  validateQueryRequest(getInventoryItemsSchema),
  InventoriesController.getItems,
)

router.get(
  '/scan/barcode',
  validateQueryRequest(scanBarcodeToDraftSchema),
  InventoriesController.scanBarcodeToDraft,
)

router.post(
  '/create',
  validateBodyRequest(createInventorySchema),
  checkPermissions('inventories.create'),
  InventoriesController.create,
)

router.post(
  '/edit',
  validateBodyRequest(editInventorySchema),
  checkPermissions('inventories.edit'),
  InventoriesController.edit,
)

router.post(
  '/remove',
  validateBodyRequest(removeInventoriesSchema),
  checkPermissions('inventories.remove'),
  InventoriesController.remove,
)

export default router
