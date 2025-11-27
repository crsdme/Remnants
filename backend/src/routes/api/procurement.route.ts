import { Router } from 'express'
import * as ProcurementController from '../../controllers/procurement.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import {
  createProcurementSchema,
  editProcurementSchema,
  getProcurementItemsSchema,
  getProcurementsSchema,
  payProcurementSchema,
  removeProcurementsSchema,
  scanBarcodeSchema,
} from '../../schemas/procurement.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getProcurementsSchema),
  ProcurementController.get,
)
router.get(
  '/get/items',
  validateQueryRequest(getProcurementItemsSchema),
  ProcurementController.getItems,
)
router.post(
  '/create',
  validateBodyRequest(createProcurementSchema),
  checkPermissions('procurement.create'),
  ProcurementController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editProcurementSchema),
  checkPermissions('procurement.edit'),
  ProcurementController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeProcurementsSchema),
  checkPermissions('procurement.remove'),
  ProcurementController.remove,
)
router.get(
  '/scan/barcode',
  validateQueryRequest(scanBarcodeSchema),
  ProcurementController.scanBarcode,
)
router.post(
  '/pay',
  validateBodyRequest(payProcurementSchema),
  checkPermissions('procurement.pay'),
  ProcurementController.pay,
)
export default router
