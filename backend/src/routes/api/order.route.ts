import type { RequestHandler } from 'express'
import {
  createOrderResponseSchema,
  createOrderSchema,
  editOrderResponseSchema,
  editOrderSchema,
  getOrderDetailsResponseSchema,
  getOrderDetailsSchema,
  getOrderItemsResponseSchema,
  getOrderItemsSchema,
  getOrdersResponseSchema,
  getOrdersSchema,
  printDraftInvoiceOrderSchema,
  printInvoiceOrderSchema,
  printOrderLabelOrderSchema,
  removeOrdersResponseSchema,
  removeOrdersSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as OrderController from '@/controllers/order.controller'
import { checkPermissions, uploadMiddleware, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

const orderFilesUpload = uploadMiddleware({
  fieldName: 'uploadedFiles',
  storageKey: 'orderFiles',
  mode: 'multiple',
  maxCount: 10,
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  allowedExtensions: ['.pdf', '.txt', '.xls', '.xlsx', '.csv', '.png', '.jpg', '.jpeg', '.webp', '.gif'],
})

router.get(
  '/get',
  validateQueryRequest(getOrdersSchema),
  validateResponse(getOrdersResponseSchema),
  OrderController.get as RequestHandler,
)

router.get(
  '/get/items',
  validateQueryRequest(getOrderItemsSchema),
  validateResponse(getOrderItemsResponseSchema),
  OrderController.getItems as RequestHandler,
)

router.get(
  '/get/details',
  validateQueryRequest(getOrderDetailsSchema),
  validateResponse(getOrderDetailsResponseSchema),
  OrderController.getDetails as RequestHandler,
)

router.post(
  '/create',
  orderFilesUpload,
  validateBodyRequest(createOrderSchema, { formData: true }),
  checkPermissions('order.create'),
  validateResponse(createOrderResponseSchema),
  OrderController.create as RequestHandler,
)

router.post(
  '/edit',
  orderFilesUpload,
  validateBodyRequest(editOrderSchema, { formData: true }),
  checkPermissions('order.edit'),
  validateResponse(editOrderResponseSchema),
  OrderController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeOrdersSchema),
  checkPermissions('order.remove'),
  validateResponse(removeOrdersResponseSchema),
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
