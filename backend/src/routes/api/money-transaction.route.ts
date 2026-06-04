import type { RequestHandler } from 'express'
import { createMoneyTransactionSchema, getMoneyTransactionsSchema } from '@remnant/shared'
import { Router } from 'express'
import * as MoneyTransactionController from '@/controllers/money-transaction.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getMoneyTransactionsSchema),
  MoneyTransactionController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createMoneyTransactionSchema),
  checkPermissions('money-transaction.create'),
  MoneyTransactionController.create as RequestHandler,
)

export default router
