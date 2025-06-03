import { Router } from 'express'
import * as LanguageController from '../../controllers/language.controller'
import { createUploadMiddleware, validateBodyRequest, validateQueryRequest, validateUpload } from '../../middleware/'
import { batchLanguageSchema, createLanguageSchema, duplicateLanguageSchema, editLanguageSchema, getLanguageSchema, removeLanguageSchema } from '../../schemas/language.schema'

const router = Router()

router.get('/get', validateQueryRequest(getLanguageSchema), LanguageController.get)
router.post('/create', validateBodyRequest(createLanguageSchema), LanguageController.create)
router.post('/edit', validateBodyRequest(editLanguageSchema), LanguageController.edit)
router.post('/remove', validateBodyRequest(removeLanguageSchema), LanguageController.remove)
router.post('/batch', validateBodyRequest(batchLanguageSchema), LanguageController.batch)
router.post('/import', createUploadMiddleware({ fieldName: 'file', storageKey: 'import' }), validateUpload('file'), LanguageController.upload)
router.post('/duplicate', validateBodyRequest(duplicateLanguageSchema), LanguageController.duplicate)

export default router
