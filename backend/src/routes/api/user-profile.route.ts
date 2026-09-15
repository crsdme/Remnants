import type { RequestHandler } from 'express'
import {
  editUserProfileResponseSchema,
  editUserProfileSchema,
  getUserProfileResponseSchema,
  getUserProfilesResponseSchema,
  getUserProfilesSchema,
  getUserProfileSchema,
  getUserProfileSummaryResponseSchema,
  getUserProfileSummarySchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as UserProfileController from '@/controllers/user-profile.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getUserProfilesSchema),
  checkPermissions('userProfile.readAll'),
  validateResponse(getUserProfilesResponseSchema),
  UserProfileController.get as RequestHandler,
)

router.get(
  '/get-one',
  validateQueryRequest(getUserProfileSchema),
  checkPermissions('userProfile.read'),
  validateResponse(getUserProfileResponseSchema),
  UserProfileController.getOne as RequestHandler,
)

router.get(
  '/summary',
  validateQueryRequest(getUserProfileSummarySchema),
  checkPermissions('userProfile.read'),
  validateResponse(getUserProfileSummaryResponseSchema),
  UserProfileController.summary as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editUserProfileSchema),
  checkPermissions('userProfile.edit'),
  validateResponse(editUserProfileResponseSchema),
  UserProfileController.edit as RequestHandler,
)

export default router
