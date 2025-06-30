import { Router } from 'express'
import * as MoneyTransactionController from '../../controllers/money-transaction.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createMoneyTransactionSchema, getMoneyTransactionsSchema } from '../../schemas/money-transaction.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getMoneyTransactionsSchema),
  MoneyTransactionController.get,
)
router.post(
  '/create',
  validateBodyRequest(createMoneyTransactionSchema),
  checkPermissions('money-transaction.create'),
  MoneyTransactionController.create,
)
// router.post(
//   '/edit',
//   validateBodyRequest(editMoneyTransactionSchema),
//   checkPermissions('money-transaction.edit'),
//   MoneyTransactionController.edit,
// )
// router.post(
//   '/remove',
//   validateBodyRequest(removeMoneyTransactionsSchema),
//   checkPermissions('money-transaction.remove'),
//   MoneyTransactionController.remove,
// )

export default router
