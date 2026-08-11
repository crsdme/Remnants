import type { RequestHandler } from 'express'
import {
  createMoneyTransactionResponseSchema,
  createMoneyTransactionSchema,
  createMoneyTransactionTransferResponseSchema,
  createMoneyTransactionTransferSchema,
  getMoneyTransactionsResponseSchema,
  getMoneyTransactionsSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as MoneyTransactionController from '@/controllers/money-transaction.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getMoneyTransactionsSchema),
  validateResponse(getMoneyTransactionsResponseSchema),
  MoneyTransactionController.get as RequestHandler,
)

router.post(
  '/create-transaction',
  validateBodyRequest(createMoneyTransactionSchema),
  checkPermissions('money-transaction.create'),
  validateResponse(createMoneyTransactionResponseSchema),
  MoneyTransactionController.createTransaction as RequestHandler,
)

router.post(
  '/create-transfer',
  validateBodyRequest(createMoneyTransactionTransferSchema),
  checkPermissions('money-transaction.create'),
  validateResponse(createMoneyTransactionTransferResponseSchema),
  MoneyTransactionController.createTransfer as RequestHandler,
)

export default router
