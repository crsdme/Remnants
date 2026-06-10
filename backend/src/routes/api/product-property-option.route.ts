import type { RequestHandler } from 'express'
import { createProductPropertyOptionSchema, editProductPropertyOptionSchema, getProductPropertyOptionSchema, removeProductPropertyOptionSchema } from '@remnant/shared'
import { Router } from 'express'
import * as ProductPropertyOptionController from '@/controllers/product-property-option.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getProductPropertyOptionSchema),
  ProductPropertyOptionController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createProductPropertyOptionSchema),
  checkPermissions('product.create'),
  ProductPropertyOptionController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editProductPropertyOptionSchema),
  checkPermissions('product.edit'),
  ProductPropertyOptionController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeProductPropertyOptionSchema),
  checkPermissions('product.remove'),
  ProductPropertyOptionController.remove as RequestHandler,
)

export default router
