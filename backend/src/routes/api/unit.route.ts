import type { RequestHandler } from 'express'
import { createUnitSchema, editUnitSchema, getUnitSchema, removeUnitSchema } from '@remnant/shared'
import { Router } from 'express'
import * as UnitController from '@/controllers/unit.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getUnitSchema),
  UnitController.get as RequestHandler,
)

router.post(
  '/create',
  checkPermissions('unit.create'),
  validateBodyRequest(createUnitSchema),
  UnitController.create as RequestHandler,
)

router.post(
  '/edit',
  checkPermissions('unit.edit'),
  validateBodyRequest(editUnitSchema),
  UnitController.edit as RequestHandler,
)

router.post(
  '/remove',
  checkPermissions('unit.remove'),
  validateBodyRequest(removeUnitSchema),
  UnitController.remove as RequestHandler,
)

export default router
