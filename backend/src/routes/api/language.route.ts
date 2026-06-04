import type { RequestHandler } from 'express'
import {
  createLanguageSchema,
  editLanguageSchema,
  getLanguageSchema,
  removeLanguageSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as LanguageController from '@/controllers/language.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getLanguageSchema),
  LanguageController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createLanguageSchema),
  checkPermissions('language.create'),
  LanguageController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editLanguageSchema),
  checkPermissions('language.edit'),
  LanguageController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeLanguageSchema),
  checkPermissions('language.remove'),
  LanguageController.remove as RequestHandler,
)

export default router
