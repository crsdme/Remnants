import type { RequestHandler } from 'express'
import {
  createOrderStatusResponseSchema,
  createOrderStatusSchema,
  editOrderStatusResponseSchema,
  editOrderStatusSchema,
  getOrderStatusesResponseSchema,
  getOrderStatusesSchema,
  removeOrderStatusesResponseSchema,
  removeOrderStatusesSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as OrderStatusController from '@/controllers/order-status.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getOrderStatusesSchema),
  validateResponse(getOrderStatusesResponseSchema),
  OrderStatusController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createOrderStatusSchema),
  checkPermissions('orderStatus.create'),
  validateResponse(createOrderStatusResponseSchema),
  OrderStatusController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editOrderStatusSchema),
  checkPermissions('orderStatus.edit'),
  validateResponse(editOrderStatusResponseSchema),
  OrderStatusController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeOrderStatusesSchema),
  checkPermissions('orderStatus.remove'),
  validateResponse(removeOrderStatusesResponseSchema),
  OrderStatusController.remove as RequestHandler,
)

export default router
