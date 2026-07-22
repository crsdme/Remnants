import type { RequestHandler } from 'express'
import { Router } from 'express'
import * as TestController from '@/controllers/test.controller'

const router = Router()

router.post(
  '/start',
  TestController.start as RequestHandler,
)

export default router
