import type { RequestHandler } from 'express'
import { editSettingSchema, getSettingsSchema } from '@remnant/shared'
import { Router } from 'express'
import * as SettingController from '@/controllers/setting.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getSettingsSchema),
  SettingController.get as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editSettingSchema),
  checkPermissions('setting.edit'),
  SettingController.edit as RequestHandler,
)

export default router
