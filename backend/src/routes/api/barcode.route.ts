import { Router } from 'express'
import * as BarcodeController from '../../controllers/barcode.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware/'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createBarcodeSchema, editBarcodeSchema, getBarcodeSchema, printBarcodeSchema, removeBarcodeSchema } from '../../schemas/barcode.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getBarcodeSchema),
  BarcodeController.get,
)
router.post(
  '/create',
  validateBodyRequest(createBarcodeSchema),
  checkPermissions('barcode.create'),
  BarcodeController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editBarcodeSchema),
  checkPermissions('barcode.edit'),
  BarcodeController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeBarcodeSchema),
  checkPermissions('barcode.remove'),
  BarcodeController.remove,
)
router.get(
  '/print',
  validateQueryRequest(printBarcodeSchema),
  checkPermissions('barcode.print'),
  BarcodeController.print,
)

export default router
