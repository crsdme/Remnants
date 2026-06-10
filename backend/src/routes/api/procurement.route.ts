// import {
//   createProcurementSchema,
//   editProcurementSchema,
//   getProcurementItemsSchema,
//   getProcurementsSchema,
//   payProcurementSchema,
//   removeProcurementsSchema,
//   scanBarcodeSchema,
// } from '@remnant/shared'
import { Router } from 'express'
// import * as ProcurementController from '@/controllers/procurement.controller'
// import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

// router.get(
//   '/get',
//   validateQueryRequest(getProcurementsSchema),
//   ProcurementController.get as RequestHandler,
// )

// router.get(
//   '/get/items',
//   validateQueryRequest(getProcurementItemsSchema),
//   ProcurementController.getItems as RequestHandler,
// )

// router.post(
//   '/create',
//   validateBodyRequest(createProcurementSchema),
//   checkPermissions('procurement.create'),
//   ProcurementController.create as RequestHandler,
// )

// router.post(
//   '/edit',
//   validateBodyRequest(editProcurementSchema),
//   checkPermissions('procurement.edit'),
//   ProcurementController.edit as RequestHandler,
// )

// router.post(
//   '/remove',
//   validateBodyRequest(removeProcurementsSchema),
//   checkPermissions('procurement.remove'),
//   ProcurementController.remove as RequestHandler,
// )

// router.get(
//   '/scan/barcode',
//   validateQueryRequest(scanBarcodeSchema),
//   ProcurementController.scanBarcode as RequestHandler,
// )

// router.post(
//   '/pay',
//   validateBodyRequest(payProcurementSchema),
//   checkPermissions('procurement.pay'),
//   ProcurementController.pay as RequestHandler,
// )

export default router
