import type { RequestHandler } from 'express'
import { createMoneyTransactionSchema, createMoneyTransactionTransferSchema, getMoneyTransactionsSchema } from '@remnant/shared'
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
  '/create-transaction',
  validateBodyRequest(createMoneyTransactionSchema),
  checkPermissions('money-transaction.create'),
  MoneyTransactionController.createTransaction as RequestHandler,
)

router.post(
  '/create-transfer',
  validateBodyRequest(createMoneyTransactionTransferSchema),
  checkPermissions('money-transaction.create'),
  MoneyTransactionController.createTransfer as RequestHandler,
)

export default router
