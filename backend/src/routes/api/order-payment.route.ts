import { Router } from 'express'
import * as OrderPaymentController from '../../controllers/order-payment.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createOrderPaymentSchema, editOrderPaymentSchema, getOrderPaymentsSchema, removeOrderPaymentsSchema } from '../../schemas/order-payment.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getOrderPaymentsSchema),
  OrderPaymentController.get,
)
router.post(
  '/create',
  validateBodyRequest(createOrderPaymentSchema),
  checkPermissions('order-payment.create'),
  OrderPaymentController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editOrderPaymentSchema),
  checkPermissions('order-payment.edit'),
  OrderPaymentController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeOrderPaymentsSchema),
  checkPermissions('order-payment.remove'),
  OrderPaymentController.remove,
)

export default router
