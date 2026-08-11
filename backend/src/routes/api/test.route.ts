import type { RequestHandler } from 'express'
import { responseSchema } from '@remnant/shared'
import { Router } from 'express'
import * as TestController from '@/controllers/test.controller'
import { validateResponse } from '@/middleware'

const router = Router()

router.post(
  '/start',
  validateResponse(responseSchema),
  TestController.start as RequestHandler,
)

export default router
