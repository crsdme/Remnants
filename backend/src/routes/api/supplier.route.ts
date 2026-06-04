import { createSupplierSchema, editSupplierSchema, getSuppliersSchema, removeSuppliersSchema } from '@remnant/shared'
import { Router } from 'express'
import * as SupplierController from '@/controllers/supplier.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

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
