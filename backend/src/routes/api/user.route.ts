import type { RequestHandler } from 'express'
import {
  createUserResponseSchema,
  createUserSchema,
  editUserResponseSchema,
  editUserSchema,
  getUserSchema,
  getUsersResponseSchema,
  removeUserResponseSchema,
  removeUserSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as UserController from '@/controllers/user.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getUserSchema),
  validateResponse(getUsersResponseSchema),
  UserController.get as RequestHandler,
)

router.post(
  '/create',
  checkPermissions('user.create'),
  validateBodyRequest(createUserSchema),
  validateResponse(createUserResponseSchema),
  UserController.create as RequestHandler,
)

router.post(
  '/edit',
  checkPermissions('user.edit'),
  validateBodyRequest(editUserSchema),
  validateResponse(editUserResponseSchema),
  UserController.edit as RequestHandler,
)

router.post(
  '/remove',
  checkPermissions('user.remove'),
  validateBodyRequest(removeUserSchema),
  validateResponse(removeUserResponseSchema),
  UserController.remove as RequestHandler,
)

export default router
