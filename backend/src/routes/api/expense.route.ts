import type { RequestHandler } from 'express'
import { createExpenseSchema, editExpenseSchema, getExpensesSchema, removeExpensesSchema } from '@remnant/shared'
import { Router } from 'express'
import * as ExpenseController from '@/controllers/expense.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getExpensesSchema),
  ExpenseController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createExpenseSchema),
  checkPermissions('expense.create'),
  ExpenseController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editExpenseSchema),
  checkPermissions('expense.edit'),
  ExpenseController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeExpensesSchema),
  checkPermissions('expense.remove'),
  ExpenseController.remove as RequestHandler,
)

export default router
