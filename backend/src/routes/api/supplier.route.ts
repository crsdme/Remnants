import { Router } from 'express'
import * as SupplierController from '../../controllers/supplier.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createSupplierSchema, editSupplierSchema, getSuppliersSchema, removeSuppliersSchema } from '../../schemas/supplier.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getSuppliersSchema),
  SupplierController.get,
)
router.post(
  '/create',
  validateBodyRequest(createSupplierSchema),
  checkPermissions('supplier.create'),
  SupplierController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editSupplierSchema),
  checkPermissions('supplier.edit'),
  SupplierController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeSuppliersSchema),
  checkPermissions('supplier.remove'),
  SupplierController.remove,
)

export default router
