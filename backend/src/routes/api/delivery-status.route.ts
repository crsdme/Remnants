import { Router } from 'express'
import * as DeliveryStatusController from '../../controllers/delivery-status.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createDeliveryStatusSchema, editDeliveryStatusSchema, getDeliveryStatusesSchema, removeDeliveryStatusesSchema } from '../../schemas/delivery-status.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getDeliveryStatusesSchema),
  DeliveryStatusController.get,
)
router.post(
  '/create',
  validateBodyRequest(createDeliveryStatusSchema),
  checkPermissions('delivery-status.create'),
  DeliveryStatusController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editDeliveryStatusSchema),
  checkPermissions('delivery-status.edit'),
  DeliveryStatusController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeDeliveryStatusesSchema),
  checkPermissions('delivery-status.remove'),
  DeliveryStatusController.remove,
)

export default router
