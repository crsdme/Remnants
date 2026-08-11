import type { RequestHandler } from 'express'
import {
  createUnitResponseSchema,
  createUnitSchema,
  editUnitResponseSchema,
  editUnitSchema,
  getUnitSchema,
  getUnitsResponseSchema,
  removeUnitSchema,
  removeUnitsResponseSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as UnitController from '@/controllers/unit.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getUnitSchema),
  validateResponse(getUnitsResponseSchema),
  UnitController.get as RequestHandler,
)

router.post(
  '/create',
  checkPermissions('unit.create'),
  validateBodyRequest(createUnitSchema),
  validateResponse(createUnitResponseSchema),
  UnitController.create as RequestHandler,
)

router.post(
  '/edit',
  checkPermissions('unit.edit'),
  validateBodyRequest(editUnitSchema),
  validateResponse(editUnitResponseSchema),
  UnitController.edit as RequestHandler,
)

router.post(
  '/remove',
  checkPermissions('unit.remove'),
  validateBodyRequest(removeUnitSchema),
  validateResponse(removeUnitsResponseSchema),
  UnitController.remove as RequestHandler,
)

export default router
