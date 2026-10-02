import type { RequestHandler } from 'express'
import { getPaymentApplicationsResponseSchema, getPaymentApplicationsSchema } from '@remnant/shared'
import { Router } from 'express'
import * as PaymentApplicationController from '@/controllers/payment-application.controller'
import { validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getPaymentApplicationsSchema),
  validateResponse(getPaymentApplicationsResponseSchema),
  PaymentApplicationController.get as RequestHandler,
)

export default router
