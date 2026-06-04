import type { RequestHandler } from 'express'
import { createClientSchema, editClientSchema, getClientsSchema, removeClientsSchema } from '@remnant/shared'
import { Router } from 'express'
import * as ClientController from '@/controllers/client.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getClientsSchema),
  ClientController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createClientSchema),
  checkPermissions('client.create'),
  ClientController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editClientSchema),
  checkPermissions('client.edit'),
  ClientController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeClientsSchema),
  checkPermissions('client.remove'),
  ClientController.remove as RequestHandler,
)

export default router
