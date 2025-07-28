import { Router } from 'express'
import * as OrderController from '../../controllers/order.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createOrderSchema, editOrderSchema, getOrdersSchema, removeOrdersSchema } from '../../schemas/order.schema'

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

export default router
