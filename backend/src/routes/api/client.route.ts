import { Router } from 'express'
import * as ClientController from '../../controllers/client.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createClientSchema, editClientSchema, getClientsSchema, removeClientsSchema } from '../../schemas/client.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getClientsSchema),
  ClientController.get,
)
router.post(
  '/create',
  validateBodyRequest(createClientSchema),
  checkPermissions('client.create'),
  ClientController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editClientSchema),
  checkPermissions('client.edit'),
  ClientController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeClientsSchema),
  checkPermissions('client.remove'),
  ClientController.remove,
)

export default router
