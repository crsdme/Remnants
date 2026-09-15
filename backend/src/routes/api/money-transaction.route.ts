import type { RequestHandler } from 'express'
import {
  cancelMoneyTransactionResponseSchema,
  cancelMoneyTransactionSchema,
  createMoneyTransactionResponseSchema,
  createMoneyTransactionSchema,
  createMoneyTransactionTransferResponseSchema,
  createMoneyTransactionTransferSchema,
  getMoneyTransactionsResponseSchema,
  getMoneyTransactionsSchema,
  receiveMoneyTransactionResponseSchema,
  receiveMoneyTransactionSchema,
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
  checkPermissions('moneyTransaction.create'),
  validateResponse(createMoneyTransactionResponseSchema),
  MoneyTransactionController.createTransaction as RequestHandler,
)

router.post(
  '/create-transfer',
  validateBodyRequest(createMoneyTransactionTransferSchema),
  checkPermissions('moneyTransaction.transfer'),
  validateResponse(createMoneyTransactionTransferResponseSchema),
  MoneyTransactionController.createTransfer as RequestHandler,
)

router.post(
  '/receive',
  validateBodyRequest(receiveMoneyTransactionSchema),
  checkPermissions('moneyTransaction.receive'),
  validateResponse(receiveMoneyTransactionResponseSchema),
  MoneyTransactionController.receive as RequestHandler,
)

router.post(
  '/cancel',
  validateBodyRequest(cancelMoneyTransactionSchema),
  checkPermissions('moneyTransaction.cancel'),
  validateResponse(cancelMoneyTransactionResponseSchema),
  MoneyTransactionController.cancel as RequestHandler,
)

export default router
