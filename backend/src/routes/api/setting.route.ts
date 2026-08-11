import type { RequestHandler } from 'express'
import {
  editSettingResponseSchema,
  editSettingSchema,
  getSettingsResponseSchema,
  getSettingsSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as SettingController from '@/controllers/setting.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getSettingsSchema),
  validateResponse(getSettingsResponseSchema),
  SettingController.get as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editSettingSchema),
  checkPermissions('setting.edit'),
  validateResponse(editSettingResponseSchema),
  SettingController.edit as RequestHandler,
)

export default router
