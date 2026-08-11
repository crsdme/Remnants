import type { RequestHandler } from 'express'
import {
  createOrderPaymentResponseSchema,
  createOrderPaymentSchema,
  editOrderPaymentResponseSchema,
  editOrderPaymentSchema,
  getOrderPaymentsResponseSchema,
  getOrderPaymentsSchema,
  removeOrderPaymentsResponseSchema,
  removeOrderPaymentsSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as OrderPaymentController from '@/controllers/order-payment.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getOrderPaymentsSchema),
  validateResponse(getOrderPaymentsResponseSchema),
  OrderPaymentController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createOrderPaymentSchema),
  checkPermissions('order-payment.create'),
  validateResponse(createOrderPaymentResponseSchema),
  OrderPaymentController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editOrderPaymentSchema),
  checkPermissions('order-payment.edit'),
  validateResponse(editOrderPaymentResponseSchema),
  OrderPaymentController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeOrderPaymentsSchema),
  checkPermissions('order-payment.remove'),
  validateResponse(removeOrderPaymentsResponseSchema),
  OrderPaymentController.remove as RequestHandler,
)

export default router
