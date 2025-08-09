import { Router } from 'express'
import * as ProductController from '../../controllers/product.controller'
import { uploadMiddleware, validateBodyRequest, validateQueryRequest, validateUpload } from '../../middleware/'
import { checkPermissions } from '../../middleware/permission.middleware'
import { batchProductSchema, createProductSchema, duplicateProductSchema, editProductSchema, exportProductsSchema, getProductSchema, removeProductSchema } from '../../schemas/product.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getProductSchema),
  ProductController.get,
)
router.post(
  '/create',
  uploadMiddleware({ fieldName: 'uploadedImages', storageKey: 'productImages', mode: 'multiple' }),
  validateBodyRequest(createProductSchema, { formData: true }),
  checkPermissions('product.create'),
  ProductController.create,
)
router.post(
  '/edit',
  uploadMiddleware({ fieldName: 'uploadedImages', storageKey: 'productImages', mode: 'multiple' }),
  validateBodyRequest(editProductSchema, { formData: true }),
  checkPermissions('product.edit'),
  ProductController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeProductSchema),
  checkPermissions('product.remove'),
  ProductController.remove,
)
router.post(
  '/batch',
  validateBodyRequest(batchProductSchema),
  checkPermissions('product.batch'),
  ProductController.batch,
)
router.post(
  '/import',
  uploadMiddleware({ fieldName: 'file', storageKey: 'importProducts' }),
  validateUpload('file'),
  checkPermissions('product.import'),
  ProductController.importHandler,
)
router.post(
  '/export',
  validateBodyRequest(exportProductsSchema),
  checkPermissions('product.export'),
  ProductController.exportHandler,
)
router.post(
  '/duplicate',
  validateBodyRequest(duplicateProductSchema),
  checkPermissions('product.duplicate'),
  ProductController.duplicate,
)
router.get(
  '/download-template',
  ProductController.downloadTemplate,
)

export default router
