import { Router } from 'express'
import * as CashregisterAccountController from '../../controllers/cashregister-account.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createCashregisterAccountSchema, editCashregisterAccountSchema, getCashregisterAccountsSchema, removeCashregisterAccountsSchema } from '../../schemas/cashregister-account.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getCashregisterAccountsSchema),
  CashregisterAccountController.get,
)
router.post(
  '/create',
  validateBodyRequest(createCashregisterAccountSchema),
  checkPermissions('cashregister-account.create'),
  CashregisterAccountController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editCashregisterAccountSchema),
  checkPermissions('cashregister-account.edit'),
  CashregisterAccountController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeCashregisterAccountsSchema),
  checkPermissions('cashregister-account.remove'),
  CashregisterAccountController.remove,
)

export default router
