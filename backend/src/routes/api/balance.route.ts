import { Router } from 'express'
import * as BalanceController from '../../controllers/balance.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createBalanceSchema, getBalanceSchema, getCurrentBalanceSchema, removeBalanceSchema } from '../../schemas/balance.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getBalanceSchema),
  BalanceController.get,
)

router.get(
  '/get-current',
  validateQueryRequest(getCurrentBalanceSchema),
  checkPermissions('balance.get-current'),
  BalanceController.getCurrent,
)

router.post(
  '/create',
  validateBodyRequest(createBalanceSchema),
  checkPermissions('balance.create'),
  BalanceController.create,
)

router.post(
  '/remove/',
  validateBodyRequest(removeBalanceSchema),
  checkPermissions('balance.remove'),
  BalanceController.remove,
)

export default router
