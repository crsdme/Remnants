import type { RequestHandler } from 'express'
import { createCashregisterAccountSchema, editCashregisterAccountSchema, getCashregisterAccountsSchema, removeCashregisterAccountsSchema } from '@remnant/shared'
import { Router } from 'express'
import * as CashregisterAccountController from '@/controllers/cashregister-account.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getCashregisterAccountsSchema),
  CashregisterAccountController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createCashregisterAccountSchema),
  checkPermissions('cashregister-account.create'),
  CashregisterAccountController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editCashregisterAccountSchema),
  checkPermissions('cashregister-account.edit'),
  CashregisterAccountController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeCashregisterAccountsSchema),
  checkPermissions('cashregister-account.remove'),
  CashregisterAccountController.remove as RequestHandler,
)

export default router
