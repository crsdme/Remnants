import { Router } from 'express'
import * as CategoryController from '../../controllers/category.controller'
import { uploadMiddleware, validateBodyRequest, validateQueryRequest, validateUpload } from '../../middleware/'
import { batchCategorySchema, createCategorySchema, duplicateCategorySchema, editCategorySchema, exportCategoriesSchema, getCategorySchema, removeCategorySchema } from '../../schemas/category.schema'

const router = Router()

router.get('/get', validateQueryRequest(getCategorySchema), CategoryController.get)
router.post('/create', validateBodyRequest(createCategorySchema), CategoryController.create)
router.post('/edit', validateBodyRequest(editCategorySchema), CategoryController.edit)
router.post('/remove', validateBodyRequest(removeCategorySchema), CategoryController.remove)
router.post('/batch', validateBodyRequest(batchCategorySchema), CategoryController.batch)
router.post('/import', uploadMiddleware({ fieldName: 'file', storageKey: 'importCategories' }), validateUpload('file'), CategoryController.importHandler)
router.post('/export', validateBodyRequest(exportCategoriesSchema), CategoryController.exportHandler)
router.post('/duplicate', validateBodyRequest(duplicateCategorySchema), CategoryController.duplicate)

export default router
