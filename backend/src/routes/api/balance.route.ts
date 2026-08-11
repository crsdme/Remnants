import type { RequestHandler } from 'express'
import {
  createBalanceResponseSchema,
  createBalanceSchema,
  getBalanceSchema,
  getBalancesResponseSchema,
  getCurrentBalanceResponseSchema,
  getCurrentBalanceSchema,
  removeBalanceSchema,
  removeBalancesResponseSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as BalanceController from '@/controllers/balance.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getBalanceSchema),
  validateResponse(getBalancesResponseSchema),
  BalanceController.get as RequestHandler,
)

router.get(
  '/get-current',
  validateQueryRequest(getCurrentBalanceSchema),
  checkPermissions('balance.get-current'),
  validateResponse(getCurrentBalanceResponseSchema),
  BalanceController.getCurrent as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createBalanceSchema),
  checkPermissions('balance.create'),
  validateResponse(createBalanceResponseSchema),
  BalanceController.create as RequestHandler,
)

router.post(
  '/remove/',
  validateBodyRequest(removeBalanceSchema),
  checkPermissions('balance.remove'),
  validateResponse(removeBalancesResponseSchema),
  BalanceController.remove as RequestHandler,
)

export default router
