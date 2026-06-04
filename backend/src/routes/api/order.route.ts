import type { RequestHandler } from 'express'
import { createOrderSchema, editOrderSchema, getOrdersSchema, printDraftInvoiceOrderSchema, printInvoiceOrderSchema, printOrderLabelOrderSchema, removeOrdersSchema } from '@remnant/shared'
import { Router } from 'express'
import * as OrderController from '@/controllers/order.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getOrdersSchema),
  OrderController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createOrderSchema),
  checkPermissions('order.create'),
  OrderController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editOrderSchema),
  checkPermissions('order.edit'),
  OrderController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeOrdersSchema),
  checkPermissions('order.remove'),
  OrderController.remove as RequestHandler,
)

router.get(
  '/print/invoice',
  validateQueryRequest(printInvoiceOrderSchema),
  checkPermissions('order.print.invoice'),
  OrderController.printInvoice as RequestHandler,
)

router.post(
  '/print/draft-invoice',
  validateBodyRequest(printDraftInvoiceOrderSchema),
  checkPermissions('order.print.draft-invoice'),
  OrderController.printDraftInvoice as RequestHandler,
)

router.get(
  '/print/order-label',
  validateQueryRequest(printOrderLabelOrderSchema),
  checkPermissions('order.print.order-label'),
  OrderController.printOrderLabel as RequestHandler,
)
export default router
