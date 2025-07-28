import { Router } from 'express'
import * as ExpenseCategoryController from '../../controllers/expense-category.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createExpenseCategorySchema, editExpenseCategorySchema, getExpenseCategoriesSchema, removeExpenseCategoriesSchema } from '../../schemas/expense-category.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getExpenseCategoriesSchema),
  ExpenseCategoryController.get,
)
router.post(
  '/create',
  validateBodyRequest(createExpenseCategorySchema),
  checkPermissions('expense-category.create'),
  ExpenseCategoryController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editExpenseCategorySchema),
  checkPermissions('expense-category.edit'),
  ExpenseCategoryController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeExpenseCategoriesSchema),
  checkPermissions('expense-category.remove'),
  ExpenseCategoryController.remove,
)

export default router
