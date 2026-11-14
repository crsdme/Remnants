import type { RequestHandler } from 'express'
import { responseSchema } from '@remnant/shared'
import { Router } from 'express'
import { z } from 'zod'
import * as TestController from '@/controllers/test.controller'
import { validateBodyRequest, validateResponse } from '@/middleware'

const router = Router()

router.post(
  '/start',
  validateBodyRequest(z.object({ key: z.string() })),
  validateResponse(responseSchema),
  TestController.start as RequestHandler,
)

export default router
