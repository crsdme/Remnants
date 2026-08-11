import type { RequestHandler } from 'express'
import {
  createProductStockStatusResponseSchema,
  createProductStockStatusSchema,
  editProductStockStatusResponseSchema,
  editProductStockStatusSchema,
  getProductStockStatusesResponseSchema,
  getProductStockStatusesSchema,
  removeProductStockStatusesResponseSchema,
  removeProductStockStatusesSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as ProductStockStatusController from '@/controllers/product-stock-status.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getProductStockStatusesSchema),
  validateResponse(getProductStockStatusesResponseSchema),
  ProductStockStatusController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createProductStockStatusSchema),
  checkPermissions('product-stock-status.create'),
  validateResponse(createProductStockStatusResponseSchema),
  ProductStockStatusController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editProductStockStatusSchema),
  checkPermissions('product-stock-status.edit'),
  validateResponse(editProductStockStatusResponseSchema),
  ProductStockStatusController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeProductStockStatusesSchema),
  checkPermissions('product-stock-status.remove'),
  validateResponse(removeProductStockStatusesResponseSchema),
  ProductStockStatusController.remove as RequestHandler,
)

export default router
