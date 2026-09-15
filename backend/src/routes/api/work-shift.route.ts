import type { RequestHandler } from 'express'
import {
  editWorkShiftResponseSchema,
  editWorkShiftSchema,
  finishWorkShiftResponseSchema,
  finishWorkShiftSchema,
  planWorkShiftResponseSchema,
  planWorkShiftSchema,
  startWorkShiftResponseSchema,
  startWorkShiftSchema,
  unplanWorkShiftResponseSchema,
  unplanWorkShiftSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as WorkShiftController from '@/controllers/work-shift.controller'
import { checkPermissions, validateBodyRequest, validateResponse } from '@/middleware'

const router = Router()

router.post(
  '/start',
  validateBodyRequest(startWorkShiftSchema),
  checkPermissions('workShift.start'),
  validateResponse(startWorkShiftResponseSchema),
  WorkShiftController.start as RequestHandler,
)

router.post(
  '/finish',
  validateBodyRequest(finishWorkShiftSchema),
  checkPermissions('workShift.start'),
  validateResponse(finishWorkShiftResponseSchema),
  WorkShiftController.finish as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editWorkShiftSchema),
  checkPermissions('workShift.edit'),
  validateResponse(editWorkShiftResponseSchema),
  WorkShiftController.edit as RequestHandler,
)

router.post(
  '/plan',
  validateBodyRequest(planWorkShiftSchema),
  checkPermissions('workShift.edit'),
  validateResponse(planWorkShiftResponseSchema),
  WorkShiftController.plan as RequestHandler,
)

router.post(
  '/unplan',
  validateBodyRequest(unplanWorkShiftSchema),
  checkPermissions('workShift.edit'),
  validateResponse(unplanWorkShiftResponseSchema),
  WorkShiftController.unplan as RequestHandler,
)

export default router
