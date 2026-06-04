import type { RequestHandler } from 'express'
import { createUserRoleSchema, editUserRoleSchema, getUserRoleSchema, removeUserRoleSchema } from '@remnant/shared'
import { Router } from 'express'
import * as UserRoleController from '@/controllers/user-role.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getUserRoleSchema),
  UserRoleController.get as RequestHandler,
)

router.post(
  '/create',
  checkPermissions('user-role.create'),
  validateBodyRequest(createUserRoleSchema),
  UserRoleController.create as RequestHandler,
)

router.post(
  '/edit',
  checkPermissions('user-role.edit'),
  validateBodyRequest(editUserRoleSchema),
  UserRoleController.edit as RequestHandler,
)

router.post(
  '/remove',
  checkPermissions('user-role.remove'),
  validateBodyRequest(removeUserRoleSchema),
  UserRoleController.remove as RequestHandler,
)

export default router
