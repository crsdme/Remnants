import type { RequestHandler } from 'express'
import {
  createOrderStatusSchema,
  editOrderStatusSchema,
  getOrderStatusesSchema,
  removeOrderStatusesSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as OrderStatusController from '@/controllers/order-status.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getOrderStatusesSchema),
  OrderStatusController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createOrderStatusSchema),
  checkPermissions('order-status.create'),
  OrderStatusController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editOrderStatusSchema),
  checkPermissions('order-status.edit'),
  OrderStatusController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeOrderStatusesSchema),
  checkPermissions('order-status.remove'),
  OrderStatusController.remove as RequestHandler,
)

export default router
