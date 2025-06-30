import { Router } from 'express'
import * as TestController from '../../controllers/test.controller'

const router = Router()

router.post(
  '/start',
  TestController.start,
)

export default router
