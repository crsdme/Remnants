import type { RequestHandler } from 'express'
import { getStatisticSchema } from '@remnant/shared'
import { Router } from 'express'
import * as StatisticController from '@/controllers/statistic.controller'
import { validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/orders/get',
  validateQueryRequest(getStatisticSchema),
  StatisticController.get as RequestHandler,
)

export default router
