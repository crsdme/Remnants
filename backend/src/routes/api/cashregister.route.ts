import type { RequestHandler } from 'express'
import { createCashregisterSchema, editCashregisterSchema, getCashregistersSchema, removeCashregistersSchema } from '@remnant/shared'
import { Router } from 'express'
import * as CashregisterController from '@/controllers/cashregister.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getCashregistersSchema),
  CashregisterController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createCashregisterSchema),
  checkPermissions('cashregister.create'),
  CashregisterController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editCashregisterSchema),
  checkPermissions('cashregister.edit'),
  CashregisterController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeCashregistersSchema),
  checkPermissions('cashregister.remove'),
  CashregisterController.remove as RequestHandler,
)

export default router
