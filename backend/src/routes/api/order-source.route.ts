import type { RequestHandler } from 'express'
import {
  createOrderSourceResponseSchema,
  createOrderSourceSchema,
  editOrderSourceResponseSchema,
  editOrderSourceSchema,
  getOrderSourcesResponseSchema,
  getOrderSourcesSchema,
  removeOrderSourcesResponseSchema,
  removeOrderSourcesSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as OrderSourceController from '@/controllers/order-source.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getOrderSourcesSchema),
  validateResponse(getOrderSourcesResponseSchema),
  OrderSourceController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createOrderSourceSchema),
  checkPermissions('order-source.create'),
  validateResponse(createOrderSourceResponseSchema),
  OrderSourceController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editOrderSourceSchema),
  checkPermissions('order-source.edit'),
  validateResponse(editOrderSourceResponseSchema),
  OrderSourceController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeOrderSourcesSchema),
  checkPermissions('order-source.remove'),
  validateResponse(removeOrderSourcesResponseSchema),
  OrderSourceController.remove as RequestHandler,
)

export default router
