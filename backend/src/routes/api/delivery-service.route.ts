import type { RequestHandler } from 'express'
import { createDeliveryServiceSchema, editDeliveryServiceSchema, getDeliveryServicesSchema, removeDeliveryServicesSchema } from '@remnant/shared'
import { Router } from 'express'
import * as DeliveryServiceController from '@/controllers/delivery-service.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getDeliveryServicesSchema),
  DeliveryServiceController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createDeliveryServiceSchema),
  checkPermissions('delivery-service.create'),
  DeliveryServiceController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editDeliveryServiceSchema),
  checkPermissions('delivery-service.edit'),
  DeliveryServiceController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeDeliveryServicesSchema),
  checkPermissions('delivery-service.remove'),
  DeliveryServiceController.remove as RequestHandler,
)

export default router
