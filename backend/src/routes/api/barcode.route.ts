import type { RequestHandler } from 'express'
import { createBarcodeSchema, editBarcodeSchema, getBarcodeByCodeSchema, getBarcodesSchema, printBarcodeSchema, removeBarcodesSchema } from '@remnant/shared'
import { Router } from 'express'
import * as BarcodeController from '@/controllers/barcode.controller'

import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getBarcodesSchema),
  BarcodeController.get as RequestHandler,
)

router.get(
  '/get-by-code',
  validateQueryRequest(getBarcodeByCodeSchema),
  BarcodeController.getByCode as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createBarcodeSchema),
  checkPermissions('barcode.create'),
  BarcodeController.create as RequestHandler,
)

router.get(
  '/generate-code',
  BarcodeController.generateCode,
)

router.post(
  '/edit',
  validateBodyRequest(editBarcodeSchema),
  checkPermissions('barcode.edit'),
  BarcodeController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeBarcodesSchema),
  checkPermissions('barcode.remove'),
  BarcodeController.remove as RequestHandler,
)

router.get(
  '/print',
  validateQueryRequest(printBarcodeSchema),
  checkPermissions('barcode.print'),
  BarcodeController.print as RequestHandler,
)

export default router
