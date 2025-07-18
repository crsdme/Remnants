import { Router } from 'express'
import * as CurrencyController from '../../controllers/currency.controller'
import { uploadMiddleware, validateBodyRequest, validateQueryRequest, validateUpload } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { batchCurrencySchema, createCurrencySchema, duplicateCurrencySchema, editCurrencySchema, getCurrencySchema, removeCurrencySchema } from '../../schemas/currency.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getCurrencySchema),
  CurrencyController.get,
)
router.post(
  '/create',
  validateBodyRequest(createCurrencySchema),
  checkPermissions('currency.create'),
  CurrencyController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editCurrencySchema),
  checkPermissions('currency.edit'),
  CurrencyController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeCurrencySchema),
  checkPermissions('currency.remove'),
  CurrencyController.remove,
)
router.post(
  '/batch',
  validateBodyRequest(batchCurrencySchema),
  checkPermissions('currency.batch'),
  CurrencyController.batch,
)
router.post(
  '/import',
  uploadMiddleware({ fieldName: 'file', storageKey: 'import' }),
  validateUpload('file'),
  checkPermissions('currency.import'),
  CurrencyController.importHandler,
)
router.post(
  '/duplicate',
  validateBodyRequest(duplicateCurrencySchema),
  checkPermissions('currency.duplicate'),
  CurrencyController.duplicate,
)

export default router
