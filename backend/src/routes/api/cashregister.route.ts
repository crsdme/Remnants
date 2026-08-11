import type { RequestHandler } from 'express'
import {
  createCashregisterResponseSchema,
  createCashregisterSchema,
  editCashregisterResponseSchema,
  editCashregisterSchema,
  getCashregistersResponseSchema,
  getCashregistersSchema,
  removeCashregistersResponseSchema,
  removeCashregistersSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as CashregisterController from '@/controllers/cashregister.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getCashregistersSchema),
  validateResponse(getCashregistersResponseSchema),
  CashregisterController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createCashregisterSchema),
  checkPermissions('cashregister.create'),
  validateResponse(createCashregisterResponseSchema),
  CashregisterController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editCashregisterSchema),
  checkPermissions('cashregister.edit'),
  validateResponse(editCashregisterResponseSchema),
  CashregisterController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeCashregistersSchema),
  checkPermissions('cashregister.remove'),
  validateResponse(removeCashregistersResponseSchema),
  CashregisterController.remove as RequestHandler,
)

export default router
