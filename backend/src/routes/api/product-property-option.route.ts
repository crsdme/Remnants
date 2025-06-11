import { Router } from 'express'
import * as ProductPropertyOptionController from '../../controllers/product-property-option.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware/'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createProductPropertyOptionSchema, editProductPropertyOptionSchema, getProductPropertyOptionSchema, removeProductPropertyOptionSchema } from '../../schemas/product-property-option.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getProductPropertyOptionSchema),
  ProductPropertyOptionController.get,
)
router.post(
  '/create',
  validateBodyRequest(createProductPropertyOptionSchema),
  checkPermissions('product.create'),
  ProductPropertyOptionController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editProductPropertyOptionSchema),
  checkPermissions('product.edit'),
  ProductPropertyOptionController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeProductPropertyOptionSchema),
  checkPermissions('product.remove'),
  ProductPropertyOptionController.remove,
)

export default router
