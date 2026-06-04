import { createWarehousesSchema, editWarehousesSchema, getWarehousesSchema, removeWarehousesSchema } from '@remnant/shared'
import { Router } from 'express'
import * as WarehouseController from '@/controllers/warehouse.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getWarehousesSchema),
  WarehouseController.get,
)

router.post(
  '/create',
  validateBodyRequest(createWarehousesSchema),
  checkPermissions('warehouse.create'),
  WarehouseController.create,
)

router.post(
  '/edit',
  validateBodyRequest(editWarehousesSchema),
  checkPermissions('warehouse.edit'),
  WarehouseController.edit,
)

router.post(
  '/remove',
  validateBodyRequest(removeWarehousesSchema),
  checkPermissions('warehouse.remove'),
  WarehouseController.remove,
)

export default router
