import type { RequestHandler } from 'express'
import {
  cancelProcurementPaymentResponseSchema,
  cancelProcurementPaymentSchema,
  confirmProcurementResponseSchema,
  confirmProcurementSchema,
  createProcurementResponseSchema,
  createProcurementSchema,
  editProcurementResponseSchema,
  editProcurementSchema,
  getProcurementItemsResponseSchema,
  getProcurementItemsSchema,
  getProcurementsResponseSchema,
  getProcurementsSchema,
  payProcurementResponseSchema,
  payProcurementSchema,
  paySupplierResponseSchema,
  paySupplierSchema,
  removeProcurementsResponseSchema,
  removeProcurementsSchema,
  scanBarcodeProcurementResponseSchema,
  scanBarcodeSchema,
  unconfirmProcurementResponseSchema,
  unconfirmProcurementSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as ProcurementController from '@/controllers/procurement.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getProcurementsSchema),
  validateResponse(getProcurementsResponseSchema),
  ProcurementController.get as RequestHandler,
)

router.get(
  '/get/items',
  validateQueryRequest(getProcurementItemsSchema),
  validateResponse(getProcurementItemsResponseSchema),
  ProcurementController.getItems as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createProcurementSchema),
  checkPermissions('procurement.create'),
  validateResponse(createProcurementResponseSchema),
  ProcurementController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editProcurementSchema),
  checkPermissions('procurement.edit'),
  validateResponse(editProcurementResponseSchema),
  ProcurementController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeProcurementsSchema),
  checkPermissions('procurement.remove'),
  validateResponse(removeProcurementsResponseSchema),
  ProcurementController.remove as RequestHandler,
)

router.get(
  '/scan/barcode',
  validateQueryRequest(scanBarcodeSchema),
  validateResponse(scanBarcodeProcurementResponseSchema),
  ProcurementController.scanBarcode as RequestHandler,
)

router.post(
  '/pay',
  validateBodyRequest(payProcurementSchema),
  checkPermissions('procurement.pay'),
  validateResponse(payProcurementResponseSchema),
  ProcurementController.pay as RequestHandler,
)

router.post(
  '/pay/cancel',
  validateBodyRequest(cancelProcurementPaymentSchema),
  checkPermissions('procurement.pay'),
  validateResponse(cancelProcurementPaymentResponseSchema),
  ProcurementController.cancelPayment as RequestHandler,
)

router.post(
  '/pay/supplier',
  validateBodyRequest(paySupplierSchema),
  checkPermissions('procurement.pay'),
  validateResponse(paySupplierResponseSchema),
  ProcurementController.paySupplier as RequestHandler,
)

router.post(
  '/confirm',
  validateBodyRequest(confirmProcurementSchema),
  checkPermissions('procurement.edit'),
  validateResponse(confirmProcurementResponseSchema),
  ProcurementController.confirm as RequestHandler,
)

router.post(
  '/unconfirm',
  validateBodyRequest(unconfirmProcurementSchema),
  checkPermissions('procurement.edit'),
  validateResponse(unconfirmProcurementResponseSchema),
  ProcurementController.unconfirm as RequestHandler,
)

export default router
