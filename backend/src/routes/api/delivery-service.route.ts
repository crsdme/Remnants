import type { RequestHandler } from 'express'
import {
  createDeliveryServiceResponseSchema,
  createDeliveryServiceSchema,
  editDeliveryServiceResponseSchema,
  editDeliveryServiceSchema,
  getDeliveryServicesResponseSchema,
  getDeliveryServicesSchema,
  removeDeliveryServicesResponseSchema,
  removeDeliveryServicesSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as DeliveryServiceController from '@/controllers/delivery-service.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getDeliveryServicesSchema),
  validateResponse(getDeliveryServicesResponseSchema),
  DeliveryServiceController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createDeliveryServiceSchema),
  checkPermissions('delivery-service.create'),
  validateResponse(createDeliveryServiceResponseSchema),
  DeliveryServiceController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editDeliveryServiceSchema),
  checkPermissions('delivery-service.edit'),
  validateResponse(editDeliveryServiceResponseSchema),
  DeliveryServiceController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeDeliveryServicesSchema),
  checkPermissions('delivery-service.remove'),
  validateResponse(removeDeliveryServicesResponseSchema),
  DeliveryServiceController.remove as RequestHandler,
)

export default router
