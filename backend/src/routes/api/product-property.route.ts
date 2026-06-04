import type { RequestHandler } from 'express'
import { createProductPropertySchema, editProductPropertySchema, getProductPropertySchema, removeProductPropertySchema } from '@remnant/shared'
import { Router } from 'express'
import * as ProductPropertyController from '@/controllers/product-property.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getProductPropertySchema),
  ProductPropertyController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createProductPropertySchema),
  checkPermissions('product-property.create'),
  ProductPropertyController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editProductPropertySchema),
  checkPermissions('product-property.edit'),
  ProductPropertyController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeProductPropertySchema),
  checkPermissions('product-property.remove'),
  ProductPropertyController.remove as RequestHandler,
)

export default router
