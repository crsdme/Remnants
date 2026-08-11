import type { RequestHandler } from 'express'
import {
  createProductPropertyResponseSchema,
  createProductPropertySchema,
  editProductPropertyResponseSchema,
  editProductPropertySchema,
  getProductPropertiesResponseSchema,
  getProductPropertySchema,
  removeProductPropertiesResponseSchema,
  removeProductPropertySchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as ProductPropertyController from '@/controllers/product-property.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getProductPropertySchema),
  validateResponse(getProductPropertiesResponseSchema),
  ProductPropertyController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createProductPropertySchema),
  checkPermissions('product-property.create'),
  validateResponse(createProductPropertyResponseSchema),
  ProductPropertyController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editProductPropertySchema),
  checkPermissions('product-property.edit'),
  validateResponse(editProductPropertyResponseSchema),
  ProductPropertyController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeProductPropertySchema),
  checkPermissions('product-property.remove'),
  validateResponse(removeProductPropertiesResponseSchema),
  ProductPropertyController.remove as RequestHandler,
)

export default router
