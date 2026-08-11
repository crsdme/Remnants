import type { RequestHandler } from 'express'
import {
  createExpenseCategoryResponseSchema,
  createExpenseCategorySchema,
  editExpenseCategoryResponseSchema,
  editExpenseCategorySchema,
  getExpenseCategoriesResponseSchema,
  getExpenseCategoriesSchema,
  removeExpenseCategoriesResponseSchema,
  removeExpenseCategoriesSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as ExpenseCategoryController from '@/controllers/expense-category.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getExpenseCategoriesSchema),
  validateResponse(getExpenseCategoriesResponseSchema),
  ExpenseCategoryController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createExpenseCategorySchema),
  checkPermissions('expense-category.create'),
  validateResponse(createExpenseCategoryResponseSchema),
  ExpenseCategoryController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editExpenseCategorySchema),
  checkPermissions('expense-category.edit'),
  validateResponse(editExpenseCategoryResponseSchema),
  ExpenseCategoryController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeExpenseCategoriesSchema),
  checkPermissions('expense-category.remove'),
  validateResponse(removeExpenseCategoriesResponseSchema),
  ExpenseCategoryController.remove as RequestHandler,
)

export default router
