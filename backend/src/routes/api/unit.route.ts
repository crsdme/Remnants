import { createUnitSchema, editUnitSchema, getUnitSchema, removeUnitSchema } from '@remnant/shared'
import { Router } from 'express'
import * as UnitController from '@/controllers/unit.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getUnitSchema),
  UnitController.get,
)

router.post(
  '/create',
  checkPermissions('unit.create'),
  validateBodyRequest(createUnitSchema),
  UnitController.create,
)

router.post(
  '/edit',
  checkPermissions('unit.edit'),
  validateBodyRequest(editUnitSchema),
  UnitController.edit,
)

router.post(
  '/remove',
  checkPermissions('unit.remove'),
  validateBodyRequest(removeUnitSchema),
  UnitController.remove,
)

export default router
