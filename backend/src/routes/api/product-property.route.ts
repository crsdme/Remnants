import { Router } from 'express'
import * as ProductPropertyController from '../../controllers/product-property.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware/'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createProductPropertySchema, editProductPropertySchema, getProductPropertySchema, removeProductPropertySchema } from '../../schemas/product-property.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getProductPropertySchema),
  ProductPropertyController.get,
)
router.post(
  '/create',
  validateBodyRequest(createProductPropertySchema),
  checkPermissions('product-property.create'),
  ProductPropertyController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editProductPropertySchema),
  checkPermissions('product-property.edit'),
  ProductPropertyController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeProductPropertySchema),
  checkPermissions('product-property.remove'),
  ProductPropertyController.remove,
)

export default router
