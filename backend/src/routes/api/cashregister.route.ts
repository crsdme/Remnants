import { Router } from 'express'
import * as CashregisterController from '../../controllers/cashregister.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createCashregisterSchema, editCashregisterSchema, getCashregistersSchema, removeCashregistersSchema } from '../../schemas/cashregister.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getCashregistersSchema),
  CashregisterController.get,
)
router.post(
  '/create',
  validateBodyRequest(createCashregisterSchema),
  checkPermissions('cashregister.create'),
  CashregisterController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editCashregisterSchema),
  checkPermissions('cashregister.edit'),
  CashregisterController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeCashregistersSchema),
  checkPermissions('cashregister.remove'),
  CashregisterController.remove,
)

export default router
