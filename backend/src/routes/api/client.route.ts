import type { RequestHandler } from 'express'
import {
  createClientResponseSchema,
  createClientSchema,
  editClientResponseSchema,
  editClientSchema,
  getClientsResponseSchema,
  getClientsSchema,
  removeClientsResponseSchema,
  removeClientsSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as ClientController from '@/controllers/client.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getClientsSchema),
  validateResponse(getClientsResponseSchema),
  ClientController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createClientSchema),
  checkPermissions('client.create'),
  validateResponse(createClientResponseSchema),
  ClientController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editClientSchema),
  checkPermissions('client.edit'),
  validateResponse(editClientResponseSchema),
  ClientController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeClientsSchema),
  checkPermissions('client.remove'),
  validateResponse(removeClientsResponseSchema),
  ClientController.remove as RequestHandler,
)

export default router
