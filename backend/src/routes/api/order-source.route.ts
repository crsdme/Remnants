import type { RequestHandler } from 'express'
import { createOrderSourceSchema, editOrderSourceSchema, getOrderSourcesSchema, removeOrderSourcesSchema } from '@remnant/shared'
import { Router } from 'express'
import * as OrderSourceController from '@/controllers/order-source.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getOrderSourcesSchema),
  OrderSourceController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createOrderSourceSchema),
  checkPermissions('order-source.create'),
  OrderSourceController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editOrderSourceSchema),
  checkPermissions('order-source.edit'),
  OrderSourceController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeOrderSourcesSchema),
  checkPermissions('order-source.remove'),
  OrderSourceController.remove as RequestHandler,
)

export default router
