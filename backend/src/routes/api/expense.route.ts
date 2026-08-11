import type { RequestHandler } from 'express'
import {
  createExpenseResponseSchema,
  createExpenseSchema,
  editExpenseResponseSchema,
  editExpenseSchema,
  getExpensesResponseSchema,
  getExpensesSchema,
  removeExpensesResponseSchema,
  removeExpensesSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as ExpenseController from '@/controllers/expense.controller'
import { checkPermissions, uploadMiddleware, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

const expenseFilesUpload = uploadMiddleware({
  fieldName: 'uploadedFiles',
  storageKey: 'expenseFiles',
  mode: 'multiple',
  maxCount: 10,
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  allowedExtensions: ['.pdf', '.txt', '.xls', '.xlsx', '.csv', '.png', '.jpg', '.jpeg', '.webp', '.gif'],
})

router.get(
  '/get',
  validateQueryRequest(getExpensesSchema),
  validateResponse(getExpensesResponseSchema),
  ExpenseController.get as RequestHandler,
)

router.post(
  '/create',
  expenseFilesUpload,
  validateBodyRequest(createExpenseSchema, { formData: true }),
  checkPermissions('expense.create'),
  validateResponse(createExpenseResponseSchema),
  ExpenseController.create as RequestHandler,
)

router.post(
  '/edit',
  expenseFilesUpload,
  validateBodyRequest(editExpenseSchema, { formData: true }),
  checkPermissions('expense.edit'),
  validateResponse(editExpenseResponseSchema),
  ExpenseController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeExpensesSchema),
  checkPermissions('expense.remove'),
  validateResponse(removeExpensesResponseSchema),
  ExpenseController.remove as RequestHandler,
)

export default router
