import { Router } from 'express'
import * as WarehouseController from '../../controllers/warehouse.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createWarehousesSchema, editWarehousesSchema, getWarehousesSchema, removeWarehousesSchema } from '../../schemas/warehouse.schema'

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
