import type {
  CreateMoneyTransactionResponse,
  CreateMoneyTransactionResponseItem,
  GetMoneyTransactionsResponse,
} from '@remnant/shared'
import type { ClientSession } from 'mongoose'
import type { CreateMoneyTransactionsPayload, GetMoneyTransactionsPayload } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { mapMoneyTransactionToDTO } from '@/mappers'
import * as MoneyTransactionRepo from '@/repositories/money-transaction.repo'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetMoneyTransactionsPayload }): Promise<GetMoneyTransactionsResponse> {
  const { items, total, page, pageSize } = await MoneyTransactionRepo.list({ payload })

  return {
    status: 'success',
    code: 'MONEY_TRANSACTIONS_FETCHED',
    message: 'Money transactions fetched',
    data: {
      items,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function create({ payload, session }: { payload: CreateMoneyTransactionsPayload, session?: ClientSession }) {
  switch (payload.type) {
    case 'transfer-account':
      return createTransferAccount({ payload, session })
    case 'transfer-cashregister':
      return createTransferCashregister({ payload, session })
    case 'income':
      return createIncome({ payload, session })
    case 'expense':
      return createExpense({ payload, session })
    case 'procurement':
      return createProcurement({ payload, session })
    default:
      throw new HttpError(400, 'Money transaction type not supported', 'MONEY_TRANSACTION_TYPE_NOT_SUPPORTED')
  }
}

type PayloadByType<T extends CreateMoneyTransactionsPayload['type']>
  = Extract<CreateMoneyTransactionsPayload, { type: T }>

async function createTransferAccount({ payload, session }: { payload: PayloadByType<'transfer-account'>, session?: ClientSession }): Promise<CreateMoneyTransactionResponse> {
  const transferId = uuidv4()

  await MoneyTransactionRepo.createOne({
    payload: {
      type: 'transfer',
      direction: 'out',
      role: 'from',
      accountId: payload.accountFrom,
      cashregisterId: payload.cashregister,
      sourceModel: payload.sourceModel,
      sourceId: payload.accountFrom,
      currency: payload.currency,
      amount: payload.amount,
      description: payload.description,
      transferId,
    },
    session,
  })

  await MoneyTransactionRepo.createOne({
    payload: {
      type: 'transfer',
      direction: 'in',
      role: 'to',
      accountId: payload.accountTo,
      cashregisterId: payload.cashregister,
      sourceModel: payload.sourceModel,
      sourceId: payload.accountTo,
      currency: payload.currency,
      amount: payload.amount,
      description: payload.description,
      transferId,
    },
    session,
  })

  return {
    status: 'success',
    code: 'MONEY_TRANSACTION_CREATED',
    message: 'Money transaction created',
  }
}

async function createTransferCashregister({ payload, session }: { payload: PayloadByType<'transfer-cashregister'>, session?: ClientSession }): Promise<CreateMoneyTransactionResponse> {
  const transferId = uuidv4()

  await MoneyTransactionRepo.createOne({
    payload: {
      type: 'transfer',
      direction: 'out',
      role: 'from',
      accountId: payload.accountFrom,
      cashregisterId: payload.cashregisterFrom,
      sourceModel: payload.sourceModel,
      sourceId: payload.accountFrom,
      currency: payload.currency,
      amount: payload.amount,
      description: payload.description,
      transferId,
    },
    session,
  })

  await MoneyTransactionRepo.createOne({
    payload: {
      type: 'transfer',
      direction: 'in',
      role: 'to',
      accountId: payload.accountTo,
      cashregisterId: payload.cashregisterTo,
      sourceModel: payload.sourceModel,
      sourceId: payload.accountTo,
      currency: payload.currency,
      amount: payload.amount,
      description: payload.description,
      transferId,
    },
    session,
  })

  return {
    status: 'success',
    code: 'MONEY_TRANSACTION_CREATED',
    message: 'Money transaction created',
  }
}

async function createExpense({ payload, session }: { payload: PayloadByType<'expense'>, session?: ClientSession }): Promise<CreateMoneyTransactionResponseItem> {
  const moneyTransaction = await MoneyTransactionRepo.createOne({
    payload: {
      type: 'expense',
      direction: 'out',
      accountId: payload.account,
      cashregisterId: payload.cashregister,
      sourceModel: payload.sourceModel,
      sourceId: payload.sourceId,
      currency: payload.currency,
      amount: payload.amount,
      description: payload.description,
      transferId: payload.transferId,
    },
    session,
  })

  return {
    status: 'success',
    code: 'MONEY_TRANSACTION_CREATED',
    message: 'Money transaction created',
    data: mapMoneyTransactionToDTO(moneyTransaction[0]),
  }
}

async function createProcurement({ payload, session }: { payload: PayloadByType<'procurement'>, session?: ClientSession }): Promise<CreateMoneyTransactionResponseItem> {
  const moneyTransaction = await MoneyTransactionRepo.createOne({
    payload: {
      type: 'procurement',
      direction: 'out',
      accountId: payload.account,
      cashregisterId: payload.cashregister,
      sourceModel: payload.sourceModel,
      sourceId: payload.sourceId,
      currency: payload.currency,
      amount: payload.amount,
      description: payload.description,
      transferId: payload.transferId,
    },
    session,
  })

  return {
    status: 'success',
    code: 'MONEY_TRANSACTION_CREATED',
    message: 'Money transaction created',
    data: mapMoneyTransactionToDTO(moneyTransaction[0]),
  }
}

async function createIncome({ payload, session }: { payload: PayloadByType<'income'>, session?: ClientSession }): Promise<CreateMoneyTransactionResponseItem> {
  const moneyTransaction = await MoneyTransactionRepo.createOne({
    payload: {
      type: 'income',
      direction: 'in',
      accountId: payload.account,
      cashregisterId: payload.cashregister,
      sourceModel: payload.sourceModel,
      sourceId: payload.sourceId,
      currency: payload.currency,
      amount: payload.amount,
      description: payload.description,
      transferId: payload.transferId,
    },
    session,
  })

  return {
    status: 'success',
    code: 'MONEY_TRANSACTION_CREATED',
    message: 'Money transaction created',
    data: mapMoneyTransactionToDTO(moneyTransaction[0]),
  }
}
