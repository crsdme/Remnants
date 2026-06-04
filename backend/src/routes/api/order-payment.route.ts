import type { RequestHandler } from 'express'
import { createOrderPaymentSchema, editOrderPaymentSchema, getOrderPaymentsSchema, removeOrderPaymentsSchema } from '@remnant/shared'
import { Router } from 'express'
import * as OrderPaymentController from '@/controllers/order-payment.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getOrderPaymentsSchema),
  OrderPaymentController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createOrderPaymentSchema),
  checkPermissions('order-payment.create'),
  OrderPaymentController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editOrderPaymentSchema),
  checkPermissions('order-payment.edit'),
  OrderPaymentController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeOrderPaymentsSchema),
  checkPermissions('order-payment.remove'),
  OrderPaymentController.remove as RequestHandler,
)

export default router
