import type { RequestHandler } from 'express'
import { getStatisticResponseSchema, getStatisticSchema } from '@remnant/shared'
import { Router } from 'express'
import * as StatisticController from '@/controllers/statistic.controller'
import { checkPermissions, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/orders/get',
  validateQueryRequest(getStatisticSchema),
  checkPermissions('orderStatistic.read'),
  validateResponse(getStatisticResponseSchema),
  StatisticController.get as RequestHandler,
)

export default router
