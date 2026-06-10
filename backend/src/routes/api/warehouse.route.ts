import type { RequestHandler } from 'express'
import { createWarehousesSchema, editWarehousesSchema, getWarehousesSchema, removeWarehousesSchema } from '@remnant/shared'
import { Router } from 'express'
import * as WarehouseController from '@/controllers/warehouse.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getWarehousesSchema),
  WarehouseController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createWarehousesSchema),
  checkPermissions('warehouse.create'),
  WarehouseController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editWarehousesSchema),
  checkPermissions('warehouse.edit'),
  WarehouseController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeWarehousesSchema),
  checkPermissions('warehouse.remove'),
  WarehouseController.remove as RequestHandler,
)

export default router
