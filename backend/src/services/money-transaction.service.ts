import type * as MoneyTransactionTypes from '../types/money-transaction.type'
import { v4 as uuidv4 } from 'uuid'
import { MoneyTransactionModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: MoneyTransactionTypes.getMoneyTransactionsParams): Promise<MoneyTransactionTypes.getMoneyTransactionsResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    type = '',
    direction = '',
    account = '',
    amount = undefined,
    currency = '',
    cashregister = '',
    description = '',
    sourceModel = '',
    sourceId = '',
    createdAt = {
      from: undefined,
      to: undefined,
    },
    updatedAt = {
      from: undefined,
      to: undefined,
    },
  } = payload.filters || {}

  const filterRules = {
    type: { type: 'string' },
    direction: { type: 'string' },
    account: { type: 'string' },
    amount: { type: 'number' },
    currency: { type: 'string' },
    cashregister: { type: 'string' },
    description: { type: 'string' },
    sourceModel: { type: 'string' },
    sourceId: { type: 'string' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { type, direction, account, amount, currency, cashregister, description, sourceModel, sourceId, createdAt, updatedAt },
    rules: filterRules,
    removed: false,
  })

  const sorters = buildSortQuery(payload.sorters || {}, { createdAt: -1 })

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $lookup: {
        from: 'currencies',
        localField: 'currency',
        foreignField: '_id',
        as: 'currencyData',
      },
    },
    {
      $lookup: {
        from: 'cashregister-accounts',
        localField: 'account',
        foreignField: '_id',
        as: 'accountData',
      },
    },
    {
      $lookup: {
        from: 'cashregisters',
        localField: 'cashregister',
        foreignField: '_id',
        as: 'cashregisterData',
      },
    },
    {
      $addFields: {
        currency: {
          $first: '$currencyData',
        },
        account: {
          $first: '$accountData',
        },
        cashregister: {
          $first: '$cashregisterData',
        },
      },
    },
    {
      $unset: ['currencyData', 'accountData', 'cashregisterData'],
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        type: 1,
        direction: 1,
        amount: 1,
        currency: {
          id: '$currency._id',
          names: '$currency.names',
          symbols: '$currency.symbols',
        },
        account: {
          id: '$account._id',
          names: '$account.names',
        },
        cashregister: {
          id: '$cashregister._id',
          names: '$cashregister.names',
        },
        sourceModel: 1,
        sourceId: 1,
        confirmed: 1,
        createdAt: 1,
        updatedAt: 1,
        description: 1,
      },
    },
    {
      $facet: {
        moneyTransactions: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const moneyTransactionsRaw = await MoneyTransactionModel.aggregate(pipeline).exec()

  const moneyTransactions = moneyTransactionsRaw[0].moneyTransactions
  const moneyTransactionsCount = moneyTransactionsRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'MONEY_TRANSACTIONS_FETCHED', message: 'Money transactions fetched', moneyTransactions, moneyTransactionsCount }
}

export async function create(payload: any) {
  if (payload.type === 'transfer-account') {
    return createTransferAccount(payload)
  }
  if (payload.type === 'transfer-cashregister') {
    return createTransferCashregister(payload)
  }
  if (payload.type === 'income') {
    return createIncome(payload)
  }
  if (payload.type === 'expense') {
    return createExpense(payload)
  }

  throw new HttpError(400, 'Money transaction type not supported', 'MONEY_TRANSACTION_TYPE_NOT_SUPPORTED')
}

async function createTransferAccount(payload: MoneyTransactionTypes.createMoneyTransferAccountParams) {
  const transferId = uuidv4()

  await createIncome({
    type: 'transfer',
    direction: 'out',
    role: 'from',
    account: payload.accountFrom,
    cashregister: payload.cashregister,
    sourceModel: payload.sourceModel,
    sourceId: payload.accountFrom,
    currency: payload.currency,
    amount: payload.amount,
    transferId,
  })

  await createIncome({
    type: 'transfer',
    direction: 'in',
    role: 'to',
    account: payload.accountTo,
    cashregister: payload.cashregister,
    sourceModel: payload.sourceModel,
    sourceId: payload.accountTo,
    currency: payload.currency,
    amount: payload.amount,
    transferId,
  })

  return { status: 'success', code: 'MONEY_TRANSACTION_CREATED', message: 'Money transaction created' }
}

async function createTransferCashregister(payload: MoneyTransactionTypes.createMoneyTransferCashregisterParams) {
  const transferId = uuidv4()

  await createIncome({
    type: 'transfer',
    direction: 'out',
    role: 'from',
    account: payload.accountFrom,
    cashregister: payload.cashregisterFrom,
    sourceModel: payload.sourceModel,
    sourceId: payload.accountFrom,
    currency: payload.currency,
    amount: payload.amount,
    transferId,
  })

  await createIncome({
    type: 'transfer',
    direction: 'in',
    role: 'to',
    account: payload.accountTo,
    cashregister: payload.cashregisterTo,
    sourceModel: payload.sourceModel,
    sourceId: payload.accountTo,
    currency: payload.currency,
    amount: payload.amount,
    transferId,
  })

  return { status: 'success', code: 'MONEY_TRANSACTION_CREATED', message: 'Money transaction created' }
}

async function createIncome(payload: MoneyTransactionTypes.createMoneyTransactionParams): Promise<MoneyTransactionTypes.createMoneyTransactionResult> {
  const moneyTransaction = await MoneyTransactionModel.create(payload)

  return { status: 'success', code: 'MONEY_TRANSACTION_CREATED', message: 'Money transaction created', moneyTransaction }
}

async function createExpense(payload: MoneyTransactionTypes.createMoneyTransactionParams): Promise<MoneyTransactionTypes.createMoneyTransactionResult> {
  const moneyTransaction = await MoneyTransactionModel.create(payload)

  return { status: 'success', code: 'MONEY_TRANSACTION_CREATED', message: 'Money transaction created', moneyTransaction }
}
