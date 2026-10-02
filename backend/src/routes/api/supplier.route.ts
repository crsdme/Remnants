import type { RequestHandler } from 'express'
import {
  createSupplierResponseSchema,
  createSupplierSchema,
  editSupplierResponseSchema,
  editSupplierSchema,
  getSuppliersResponseSchema,
  getSuppliersSchema,
  removeSuppliersResponseSchema,
  removeSuppliersSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as SupplierController from '@/controllers/supplier.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getSuppliersSchema),
  validateResponse(getSuppliersResponseSchema),
  SupplierController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createSupplierSchema),
  checkPermissions('supplier.create'),
  validateResponse(createSupplierResponseSchema),
  SupplierController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editSupplierSchema),
  checkPermissions('supplier.edit'),
  validateResponse(editSupplierResponseSchema),
  SupplierController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeSuppliersSchema),
  checkPermissions('supplier.remove'),
  validateResponse(removeSuppliersResponseSchema),
  SupplierController.remove as RequestHandler,
)

export default router
