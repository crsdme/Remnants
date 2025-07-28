import { Router } from 'express'
import * as ExpenseController from '../../controllers/expense.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createExpenseSchema, editExpenseSchema, getExpensesSchema, removeExpensesSchema } from '../../schemas/expense.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getExpensesSchema),
  ExpenseController.get,
)
router.post(
  '/create',
  validateBodyRequest(createExpenseSchema),
  checkPermissions('expense.create'),
  ExpenseController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editExpenseSchema),
  checkPermissions('expense.edit'),
  ExpenseController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeExpensesSchema),
  checkPermissions('expense.remove'),
  ExpenseController.remove,
)

export default router
