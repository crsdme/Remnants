import { Router } from 'express'
import * as AutomationController from '../../controllers/automation.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware/'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createAutomationSchema, editAutomationSchema, getAutomationsSchema, removeAutomationsSchema } from '../../schemas/automation.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getAutomationsSchema),
  AutomationController.get,
)
router.post(
  '/create',
  validateBodyRequest(createAutomationSchema),
  checkPermissions('automation.create'),
  AutomationController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editAutomationSchema),
  checkPermissions('automation.edit'),
  AutomationController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeAutomationsSchema),
  checkPermissions('automation.remove'),
  AutomationController.remove,
)

export default router
