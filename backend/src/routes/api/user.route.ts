import type { RequestHandler } from 'express'
import { createUserSchema, editUserSchema, getUserSchema, removeUserSchema } from '@remnant/shared'
import { Router } from 'express'
import * as UserController from '@/controllers/user.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getUserSchema),
  UserController.get as RequestHandler,
)

router.post(
  '/create',
  checkPermissions('user.create'),
  validateBodyRequest(createUserSchema),
  UserController.create as RequestHandler,
)

router.post(
  '/edit',
  checkPermissions('user.edit'),
  validateBodyRequest(editUserSchema),
  UserController.edit as RequestHandler,
)

router.post(
  '/remove',
  checkPermissions('user.remove'),
  validateBodyRequest(removeUserSchema),
  UserController.remove as RequestHandler,
)

export default router
