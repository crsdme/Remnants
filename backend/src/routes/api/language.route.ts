import type { RequestHandler } from 'express'
import {
  createLanguageResponseSchema,
  createLanguageSchema,
  editLanguageResponseSchema,
  editLanguageSchema,
  getLanguageSchema,
  getLanguagesResponseSchema,
  removeLanguageResponseSchema,
  removeLanguageSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as LanguageController from '@/controllers/language.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getLanguageSchema),
  validateResponse(getLanguagesResponseSchema),
  LanguageController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createLanguageSchema),
  checkPermissions('language.create'),
  validateResponse(createLanguageResponseSchema),
  LanguageController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editLanguageSchema),
  checkPermissions('language.edit'),
  validateResponse(editLanguageResponseSchema),
  LanguageController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeLanguageSchema),
  checkPermissions('language.remove'),
  validateResponse(removeLanguageResponseSchema),
  LanguageController.remove as RequestHandler,
)

export default router
