import type { RequestHandler } from 'express'
import { createExpenseCategorySchema, editExpenseCategorySchema, getExpenseCategoriesSchema, removeExpenseCategoriesSchema } from '@remnant/shared'
import { Router } from 'express'
import * as ExpenseCategoryController from '@/controllers/expense-category.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getExpenseCategoriesSchema),
  ExpenseCategoryController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createExpenseCategorySchema),
  checkPermissions('expense-category.create'),
  ExpenseCategoryController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editExpenseCategorySchema),
  checkPermissions('expense-category.edit'),
  ExpenseCategoryController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeExpenseCategoriesSchema),
  checkPermissions('expense-category.remove'),
  ExpenseCategoryController.remove as RequestHandler,
)

export default router
