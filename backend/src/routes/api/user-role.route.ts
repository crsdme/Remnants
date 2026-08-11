import type { RequestHandler } from 'express'
import {
  createUserRoleResponseSchema,
  createUserRoleSchema,
  editUserRoleResponseSchema,
  editUserRoleSchema,
  getUserRoleSchema,
  getUserRolesResponseSchema,
  removeUserRoleSchema,
  removeUserRolesResponseSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as UserRoleController from '@/controllers/user-role.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getUserRoleSchema),
  validateResponse(getUserRolesResponseSchema),
  UserRoleController.get as RequestHandler,
)

router.post(
  '/create',
  checkPermissions('user-role.create'),
  validateBodyRequest(createUserRoleSchema),
  validateResponse(createUserRoleResponseSchema),
  UserRoleController.create as RequestHandler,
)

router.post(
  '/edit',
  checkPermissions('user-role.edit'),
  validateBodyRequest(editUserRoleSchema),
  validateResponse(editUserRoleResponseSchema),
  UserRoleController.edit as RequestHandler,
)

router.post(
  '/remove',
  checkPermissions('user-role.remove'),
  validateBodyRequest(removeUserRoleSchema),
  validateResponse(removeUserRolesResponseSchema),
  UserRoleController.remove as RequestHandler,
)

export default router
