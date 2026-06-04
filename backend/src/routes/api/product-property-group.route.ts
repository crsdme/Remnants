import type { RequestHandler } from 'express'
import { createProductPropertyGroupSchema, editProductPropertyGroupSchema, getProductPropertyGroupSchema, removeProductPropertyGroupSchema } from '@remnant/shared'
import { Router } from 'express'
import * as ProductPropertyGroupController from '@/controllers/product-property-group.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getProductPropertyGroupSchema),
  ProductPropertyGroupController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createProductPropertyGroupSchema),
  checkPermissions('product-property-group.create'),
  ProductPropertyGroupController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editProductPropertyGroupSchema),
  checkPermissions('product-property-group.edit'),
  ProductPropertyGroupController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeProductPropertyGroupSchema),
  checkPermissions('product-property-group.remove'),
  ProductPropertyGroupController.remove as RequestHandler,
)

export default router
