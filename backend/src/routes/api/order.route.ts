import { Router } from 'express'
import * as OrderController from '../../controllers/order.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createOrderSchema, editOrderSchema, getOrdersSchema, printDraftInvoiceOrderSchema, printInvoiceOrderSchema, removeOrdersSchema } from '../../schemas/order.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getOrdersSchema),
  OrderController.get,
)
router.post(
  '/create',
  validateBodyRequest(createOrderSchema),
  checkPermissions('order.create'),
  OrderController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editOrderSchema),
  checkPermissions('order.edit'),
  OrderController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeOrdersSchema),
  checkPermissions('order.remove'),
  OrderController.remove,
)
router.get(
  '/print/invoice',
  validateQueryRequest(printInvoiceOrderSchema),
  checkPermissions('order.print.invoice'),
  OrderController.printInvoice,
)

router.post(
  '/print/draft-invoice',
  validateBodyRequest(printDraftInvoiceOrderSchema),
  checkPermissions('order.print.draft-invoice'),
  OrderController.printDraftInvoice,
)

export default router
