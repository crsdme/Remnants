import type { RequestHandler } from 'express'
import {
  createBarcodeResponseSchema,
  createBarcodeSchema,
  editBarcodeResponseSchema,
  editBarcodeSchema,
  generateCodeResponseSchema,
  getBarcodeByCodeResponseSchema,
  getBarcodeByCodeSchema,
  getBarcodesResponseSchema,
  getBarcodesSchema,
  printBarcodeSchema,
  removeBarcodesResponseSchema,
  removeBarcodesSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as BarcodeController from '@/controllers/barcode.controller'

import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getBarcodesSchema),
  validateResponse(getBarcodesResponseSchema),
  BarcodeController.get as RequestHandler,
)

router.get(
  '/get-by-code',
  validateQueryRequest(getBarcodeByCodeSchema),
  validateResponse(getBarcodeByCodeResponseSchema),
  BarcodeController.getByCode as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createBarcodeSchema),
  checkPermissions('barcode.create'),
  validateResponse(createBarcodeResponseSchema),
  BarcodeController.create as RequestHandler,
)

router.get(
  '/generate-code',
  validateResponse(generateCodeResponseSchema),
  BarcodeController.generateCode,
)

router.post(
  '/edit',
  validateBodyRequest(editBarcodeSchema),
  checkPermissions('barcode.edit'),
  validateResponse(editBarcodeResponseSchema),
  BarcodeController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeBarcodesSchema),
  checkPermissions('barcode.remove'),
  validateResponse(removeBarcodesResponseSchema),
  BarcodeController.remove as RequestHandler,
)

router.get(
  '/print',
  validateQueryRequest(printBarcodeSchema),
  checkPermissions('barcode.print'),
  BarcodeController.print as RequestHandler,
)

export default router
