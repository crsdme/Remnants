import type { RequestHandler } from 'express'
import { createBalanceSchema, getBalanceSchema, getCurrentBalanceSchema, removeBalanceSchema } from '@remnant/shared'
import { Router } from 'express'
import * as BalanceController from '@/controllers/balance.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getBalanceSchema),
  BalanceController.get as RequestHandler,
)

router.get(
  '/get-current',
  validateQueryRequest(getCurrentBalanceSchema),
  checkPermissions('balance.get-current'),
  BalanceController.getCurrent as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createBalanceSchema),
  checkPermissions('balance.create'),
  BalanceController.create as RequestHandler,
)

router.post(
  '/remove/',
  validateBodyRequest(removeBalanceSchema),
  checkPermissions('balance.remove'),
  BalanceController.remove as RequestHandler,
)

export default router
