import type { RequestHandler } from 'express'
import {
  createAutomationResponseSchema,
  createAutomationSchema,
  editAutomationResponseSchema,
  editAutomationSchema,
  getAutomationsResponseSchema,
  getAutomationsSchema,
  removeAutomationsResponseSchema,
  removeAutomationsSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as AutomationController from '@/controllers/automation.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getAutomationsSchema),
  validateResponse(getAutomationsResponseSchema),
  AutomationController.get as RequestHandler,
)
router.post(
  '/create',
  validateBodyRequest(createAutomationSchema),
  checkPermissions('automation.create'),
  validateResponse(createAutomationResponseSchema),
  AutomationController.create as RequestHandler,
)
router.post(
  '/edit',
  validateBodyRequest(editAutomationSchema),
  checkPermissions('automation.edit'),
  validateResponse(editAutomationResponseSchema),
  AutomationController.edit as RequestHandler,
)
router.post(
  '/remove',
  validateBodyRequest(removeAutomationsSchema),
  checkPermissions('automation.remove'),
  validateResponse(removeAutomationsResponseSchema),
  AutomationController.remove as RequestHandler,
)

export default router
