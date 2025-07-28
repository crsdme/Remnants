import { Router } from 'express'
import * as OrderStatusController from '../../controllers/order-status.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createOrderStatusSchema, editOrderStatusSchema, getOrderStatusesSchema, removeOrderStatusesSchema } from '../../schemas/order-status.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getOrderStatusesSchema),
  OrderStatusController.get,
)
router.post(
  '/create',
  validateBodyRequest(createOrderStatusSchema),
  checkPermissions('order-status.create'),
  OrderStatusController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editOrderStatusSchema),
  checkPermissions('order-status.edit'),
  OrderStatusController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeOrderStatusesSchema),
  checkPermissions('order-status.remove'),
  OrderStatusController.remove,
)

export default router
