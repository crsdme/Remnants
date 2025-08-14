import { Router } from 'express'
import * as StatisticController from '../../controllers/statistic.controller'
import { validateQueryRequest } from '../../middleware'
import { getStatisticSchema } from '../../schemas/statistic.schema'

const router = Router()

router.get(
  '/orders/get',
  validateQueryRequest(getStatisticSchema),
  StatisticController.get,
)

export default router
