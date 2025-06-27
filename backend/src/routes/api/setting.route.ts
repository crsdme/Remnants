import { Router } from 'express'
import * as SettingController from '../../controllers/setting.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { editSettingSchema, getSettingSchema } from '../../schemas/setting.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getSettingSchema),
  SettingController.get,
)
router.post(
  '/edit',
  validateBodyRequest(editSettingSchema),
  checkPermissions('setting.edit'),
  SettingController.edit,
)

export default router
