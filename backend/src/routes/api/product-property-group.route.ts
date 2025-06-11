import { Router } from 'express'
import * as ProductPropertyGroupController from '../../controllers/product-property-group.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware/'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createProductPropertyGroupSchema, editProductPropertyGroupSchema, getProductPropertyGroupSchema, removeProductPropertyGroupSchema } from '../../schemas/product-property-group.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getProductPropertyGroupSchema),
  ProductPropertyGroupController.get,
)
router.post(
  '/create',
  validateBodyRequest(createProductPropertyGroupSchema),
  checkPermissions('product-property-group.create'),
  ProductPropertyGroupController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editProductPropertyGroupSchema),
  checkPermissions('product-property-group.edit'),
  ProductPropertyGroupController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeProductPropertyGroupSchema),
  checkPermissions('product-property-group.remove'),
  ProductPropertyGroupController.remove,
)

export default router
