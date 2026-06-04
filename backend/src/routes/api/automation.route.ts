import type { RequestHandler } from 'express'
import { createAutomationSchema, editAutomationSchema, getAutomationsSchema, removeAutomationsSchema } from '@remnant/shared'
import { Router } from 'express'
import * as AutomationController from '@/controllers/automation.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getAutomationsSchema),
  AutomationController.get as RequestHandler,
)
router.post(
  '/create',
  validateBodyRequest(createAutomationSchema),
  checkPermissions('automation.create'),
  AutomationController.create as RequestHandler,
)
router.post(
  '/edit',
  validateBodyRequest(editAutomationSchema),
  checkPermissions('automation.edit'),
  AutomationController.edit as RequestHandler,
)
router.post(
  '/remove',
  validateBodyRequest(removeAutomationsSchema),
  checkPermissions('automation.remove'),
  AutomationController.remove as RequestHandler,
)

export default router
