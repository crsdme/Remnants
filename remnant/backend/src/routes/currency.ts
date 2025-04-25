import { Router } from 'express'
import * as CurrencyController from '../controllers/currency'
import { uploadSingle } from '../middleware/upload.middleware'
import {
  validateBatchCurrency,
  validateCreateCurrency,
  validateEditCurrency,
  validateGetCurrencies,
  validateImportCurrencies,
  validateRemoveCurrency,
} from '../middleware/validation/'

const router = Router()

router.get('/get', validateGetCurrencies, CurrencyController.get)
router.post('/create', validateCreateCurrency, CurrencyController.create)
router.post('/edit', validateEditCurrency, CurrencyController.edit)
router.post('/remove', validateRemoveCurrency, CurrencyController.remove)
router.post('/batch', validateBatchCurrency, CurrencyController.batch)
router.post(
  '/import',
  uploadSingle('file'),
  CurrencyController.importCurrencies,
)

export default router
