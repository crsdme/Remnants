import { Router } from 'express'
import * as OrderSourceController from '../../controllers/order-source.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createOrderSourceSchema, editOrderSourceSchema, getOrderSourcesSchema, removeOrderSourcesSchema } from '../../schemas/order-source.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getOrderSourcesSchema),
  OrderSourceController.get,
)
router.post(
  '/create',
  validateBodyRequest(createOrderSourceSchema),
  checkPermissions('order-source.create'),
  OrderSourceController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editOrderSourceSchema),
  checkPermissions('order-source.edit'),
  OrderSourceController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeOrderSourcesSchema),
  checkPermissions('order-source.remove'),
  OrderSourceController.remove,
)

export default router
