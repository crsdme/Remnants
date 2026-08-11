import type { RequestHandler } from 'express'
import {
  createProductPropertyGroupResponseSchema,
  createProductPropertyGroupSchema,
  editProductPropertyGroupResponseSchema,
  editProductPropertyGroupSchema,
  getProductPropertyGroupSchema,
  getProductPropertyGroupsResponseSchema,
  removeProductPropertyGroupSchema,
  removeProductPropertyGroupsResponseSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as ProductPropertyGroupController from '@/controllers/product-property-group.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getProductPropertyGroupSchema),
  validateResponse(getProductPropertyGroupsResponseSchema),
  ProductPropertyGroupController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createProductPropertyGroupSchema),
  checkPermissions('product-property-group.create'),
  validateResponse(createProductPropertyGroupResponseSchema),
  ProductPropertyGroupController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editProductPropertyGroupSchema),
  checkPermissions('product-property-group.edit'),
  validateResponse(editProductPropertyGroupResponseSchema),
  ProductPropertyGroupController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeProductPropertyGroupSchema),
  checkPermissions('product-property-group.remove'),
  validateResponse(removeProductPropertyGroupsResponseSchema),
  ProductPropertyGroupController.remove as RequestHandler,
)

export default router
