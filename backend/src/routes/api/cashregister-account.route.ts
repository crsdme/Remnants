import type { RequestHandler } from 'express'
import {
  createCashregisterAccountResponseSchema,
  createCashregisterAccountSchema,
  editCashregisterAccountResponseSchema,
  editCashregisterAccountSchema,
  getCashregisterAccountsResponseSchema,
  getCashregisterAccountsSchema,
  removeCashregisterAccountsResponseSchema,
  removeCashregisterAccountsSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as CashregisterAccountController from '@/controllers/cashregister-account.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getCashregisterAccountsSchema),
  validateResponse(getCashregisterAccountsResponseSchema),
  CashregisterAccountController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createCashregisterAccountSchema),
  checkPermissions('cashregister-account.create'),
  validateResponse(createCashregisterAccountResponseSchema),
  CashregisterAccountController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editCashregisterAccountSchema),
  checkPermissions('cashregister-account.edit'),
  validateResponse(editCashregisterAccountResponseSchema),
  CashregisterAccountController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeCashregisterAccountsSchema),
  checkPermissions('cashregister-account.remove'),
  validateResponse(removeCashregisterAccountsResponseSchema),
  CashregisterAccountController.remove as RequestHandler,
)

export default router
