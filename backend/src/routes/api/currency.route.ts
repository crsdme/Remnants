import { Router } from 'express'
import * as CurrencyController from '../../controllers/currency.controller'
import { uploadMiddleware, validateBodyRequest, validateQueryRequest, validateUpload } from '../../middleware'
import { batchCurrencySchema, createCurrencySchema, duplicateCurrencySchema, editCurrencySchema, getCurrencySchema, removeCurrencySchema } from '../../schemas/currency.schema'

const router = Router()

router.get('/get', validateQueryRequest(getCurrencySchema), CurrencyController.get)
router.post('/create', validateBodyRequest(createCurrencySchema), CurrencyController.create)
router.post('/edit', validateBodyRequest(editCurrencySchema), CurrencyController.edit)
router.post('/remove', validateBodyRequest(removeCurrencySchema), CurrencyController.remove)
router.post('/batch', validateBodyRequest(batchCurrencySchema), CurrencyController.batch)
router.post('/import', uploadMiddleware({ fieldName: 'file', storageKey: 'import' }), validateUpload('file'), CurrencyController.importHandler)
router.post('/duplicate', validateBodyRequest(duplicateCurrencySchema), CurrencyController.duplicate)

export default router
