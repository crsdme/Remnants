import type { RequestHandler } from 'express'
import {
  createWarehousesResponseSchema,
  createWarehousesSchema,
  editWarehousesResponseSchema,
  editWarehousesSchema,
  getWarehousesResponseSchema,
  getWarehousesSchema,
  removeWarehousesResponseSchema,
  removeWarehousesSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as WarehouseController from '@/controllers/warehouse.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getWarehousesSchema),
  validateResponse(getWarehousesResponseSchema),
  WarehouseController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createWarehousesSchema),
  checkPermissions('warehouse.create'),
  validateResponse(createWarehousesResponseSchema),
  WarehouseController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editWarehousesSchema),
  checkPermissions('warehouse.edit'),
  validateResponse(editWarehousesResponseSchema),
  WarehouseController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeWarehousesSchema),
  checkPermissions('warehouse.remove'),
  validateResponse(removeWarehousesResponseSchema),
  WarehouseController.remove as RequestHandler,
)

export default router
