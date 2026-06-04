import type { RequestHandler } from 'express'
import { batchProductSchema, createProductSchema, editProductSchema, exportProductsSchema, getProductSchema, removeProductSchema } from '@remnant/shared'
import { Router } from 'express'
import * as ProductController from '@/controllers/product.controller'
import { checkPermissions, uploadMiddleware, validateBodyRequest, validateQueryRequest, validateUpload } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getProductSchema),
  ProductController.get as RequestHandler,
)

router.post(
  '/create',
  uploadMiddleware({ fieldName: 'uploadedImages', storageKey: 'productImages', mode: 'multiple' }),
  validateBodyRequest(createProductSchema, { formData: true }),
  checkPermissions('product.create'),
  ProductController.create as RequestHandler,
)

router.post(
  '/edit',
  uploadMiddleware({ fieldName: 'uploadedImages', storageKey: 'productImages', mode: 'multiple' }),
  validateBodyRequest(editProductSchema, { formData: true }),
  checkPermissions('product.edit'),
  ProductController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeProductSchema),
  checkPermissions('product.remove'),
  ProductController.remove as RequestHandler,
)

router.post(
  '/batch',
  validateBodyRequest(batchProductSchema),
  checkPermissions('product.batch'),
  ProductController.batch as RequestHandler,
)

router.post(
  '/import',
  uploadMiddleware({ fieldName: 'file', storageKey: 'importProducts' }),
  validateUpload('file'),
  checkPermissions('product.import'),
  ProductController.importHandler as RequestHandler,
)

router.post(
  '/export',
  validateBodyRequest(exportProductsSchema),
  checkPermissions('product.export'),
  ProductController.exportHandler as RequestHandler,
)

router.get(
  '/download-template',
  ProductController.downloadTemplate as RequestHandler,
)

export default router
