import type { RequestHandler } from 'express'
import {
  createProductPropertyOptionResponseSchema,
  createProductPropertyOptionSchema,
  editProductPropertyOptionResponseSchema,
  editProductPropertyOptionSchema,
  getProductPropertyOptionSchema,
  getProductPropertyOptionsResponseSchema,
  removeProductPropertyOptionSchema,
  removeProductPropertyOptionsResponseSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as ProductPropertyOptionController from '@/controllers/product-property-option.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getProductPropertyOptionSchema),
  validateResponse(getProductPropertyOptionsResponseSchema),
  ProductPropertyOptionController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createProductPropertyOptionSchema),
  checkPermissions('product.create'),
  validateResponse(createProductPropertyOptionResponseSchema),
  ProductPropertyOptionController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editProductPropertyOptionSchema),
  checkPermissions('product.edit'),
  validateResponse(editProductPropertyOptionResponseSchema),
  ProductPropertyOptionController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeProductPropertyOptionSchema),
  checkPermissions('product.remove'),
  validateResponse(removeProductPropertyOptionsResponseSchema),
  ProductPropertyOptionController.remove as RequestHandler,
)

export default router
