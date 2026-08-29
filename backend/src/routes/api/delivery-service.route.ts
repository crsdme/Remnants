import type { RequestHandler } from 'express'
import {
  createDeliveryServiceResponseSchema,
  createDeliveryServiceSchema,
  editDeliveryServiceResponseSchema,
  editDeliveryServiceSchema,
  getDeliveryCapabilitiesResponseSchema,
  getDeliveryCapabilitiesSchema,
  getDeliveryLocationsResponseSchema,
  getDeliveryLocationsSchema,
  getDeliveryServicesResponseSchema,
  getDeliveryServicesSchema,
  lookupDeliveryShipmentResponseSchema,
  lookupDeliveryShipmentSchema,
  removeDeliveryServicesResponseSchema,
  removeDeliveryServicesSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as DeliveryCarrierController from '@/controllers/delivery-carrier.controller'
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

router.get(
  '/capabilities/get',
  validateQueryRequest(getDeliveryCapabilitiesSchema),
  validateResponse(getDeliveryCapabilitiesResponseSchema),
  DeliveryCarrierController.getCapabilities as RequestHandler,
)

router.post(
  '/locations/get',
  validateBodyRequest(getDeliveryLocationsSchema),
  validateResponse(getDeliveryLocationsResponseSchema),
  DeliveryCarrierController.getLocations as RequestHandler,
)

router.post(
  '/shipment/lookup',
  validateBodyRequest(lookupDeliveryShipmentSchema),
  checkPermissions('order.page'),
  validateResponse(lookupDeliveryShipmentResponseSchema),
  DeliveryCarrierController.lookupShipment as RequestHandler,
)

export default router
