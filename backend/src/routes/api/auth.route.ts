import type { RequestHandler } from 'express'
import {
  loginResponseSchema,
  loginSchema,
  logoutResponseSchema,
  refreshResponseSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as AuthController from '@/controllers/auth.controller'
import { refreshJWT, validateBodyRequest, validateResponse } from '@/middleware'

const router = Router()

router.post(
  '/login',
  validateBodyRequest(loginSchema),
  validateResponse(loginResponseSchema),
  AuthController.login as RequestHandler,
)

router.post(
  '/refresh',
  refreshJWT,
  validateResponse(refreshResponseSchema),
  AuthController.refresh as RequestHandler,
)

router.post(
  '/logout',
  validateResponse(logoutResponseSchema),
  AuthController.logout as RequestHandler,
)

export default router
