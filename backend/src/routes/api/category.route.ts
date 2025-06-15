import { Router } from 'express'
import * as CategoryController from '../../controllers/category.controller'
import { uploadMiddleware, validateBodyRequest, validateQueryRequest, validateUpload } from '../../middleware/'
import { checkPermissions } from '../../middleware/permission.middleware'
import { batchCategorySchema, createCategorySchema, duplicateCategorySchema, editCategorySchema, exportCategoriesSchema, getCategorySchema, removeCategorySchema } from '../../schemas/category.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getCategorySchema),
  CategoryController.get,
)
router.post(
  '/create',
  validateBodyRequest(createCategorySchema),
  checkPermissions('category.create'),
  CategoryController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editCategorySchema),
  checkPermissions('category.edit'),
  CategoryController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeCategorySchema),
  checkPermissions('category.remove'),
  CategoryController.remove,
)
router.post(
  '/batch',
  validateBodyRequest(batchCategorySchema),
  checkPermissions('category.batch'),
  CategoryController.batch,
)
router.post(
  '/import',
  uploadMiddleware({ fieldName: 'file', storageKey: 'importCategories' }),
  validateUpload('file'),
  checkPermissions('category.import'),
  CategoryController.importHandler,
)
router.post(
  '/export',
  validateBodyRequest(exportCategoriesSchema),
  checkPermissions('category.export'),
  CategoryController.exportHandler,
)
router.post(
  '/duplicate',
  validateBodyRequest(duplicateCategorySchema),
  checkPermissions('category.duplicate'),
  CategoryController.duplicate,
)

export default router
