import { Router } from 'express'
import * as DeliveryServiceController from '../../controllers/delivery-service.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createDeliveryServiceSchema, editDeliveryServiceSchema, getDeliveryServicesSchema, removeDeliveryServicesSchema } from '../../schemas/delivery-service.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getDeliveryServicesSchema),
  DeliveryServiceController.get,
)
router.post(
  '/create',
  validateBodyRequest(createDeliveryServiceSchema),
  checkPermissions('delivery-service.create'),
  DeliveryServiceController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editDeliveryServiceSchema),
  checkPermissions('delivery-service.edit'),
  DeliveryServiceController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeDeliveryServicesSchema),
  checkPermissions('delivery-service.remove'),
  DeliveryServiceController.remove,
)

export default router
