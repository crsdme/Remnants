import { Router } from 'express'
import * as LanguageController from '../../controllers/language.controller'
import { uploadMiddleware, validateBodyRequest, validateQueryRequest, validateUpload } from '../../middleware/'
import { checkPermissions } from '../../middleware/permission.middleware'
import { batchLanguageSchema, createLanguageSchema, duplicateLanguageSchema, editLanguageSchema, getLanguageSchema, removeLanguageSchema } from '../../schemas/language.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getLanguageSchema),
  LanguageController.get,
)
router.post(
  '/create',
  validateBodyRequest(createLanguageSchema),
  checkPermissions('language.create'),
  LanguageController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editLanguageSchema),
  checkPermissions('language.edit'),
  LanguageController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeLanguageSchema),
  checkPermissions('language.remove'),
  LanguageController.remove,
)
router.post(
  '/batch',
  validateBodyRequest(batchLanguageSchema),
  checkPermissions('language.batch'),
  LanguageController.batch,
)
router.post(
  '/import',
  uploadMiddleware({ fieldName: 'file', storageKey: 'import' }),
  validateUpload('file'),
  checkPermissions('language.import'),
  LanguageController.importHandler,
)
router.post(
  '/duplicate',
  validateBodyRequest(duplicateLanguageSchema),
  checkPermissions('language.duplicate'),
  LanguageController.duplicate,
)

export default router
