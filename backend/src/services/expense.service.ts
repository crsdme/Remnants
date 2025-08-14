import type * as ExpenseTypes from '../types/expense.type'
import { ExpenseModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'
import * as MoneyTransactionService from './money-transaction.service'

export async function get(payload: ExpenseTypes.getExpensesParams): Promise<ExpenseTypes.getExpensesResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    ids = [],
    amount = undefined,
    currency = undefined,
    cashregister = undefined,
    cashregisterAccount = undefined,
    categories = undefined,
    sourceModel = undefined,
    sourceId = undefined,
    type = undefined,
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
    _id: { type: 'array' },
    amount: { type: 'exact' },
    currency: { type: 'exact' },
    cashregister: { type: 'exact' },
    cashregisterAccount: { type: 'exact' },
    categories: { type: 'array' },
    sourceModel: { type: 'exact' },
    sourceId: { type: 'exact' },
    type: { type: 'exact' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { ids, amount, currency, cashregister, cashregisterAccount, categories, sourceModel, sourceId, type, createdAt, updatedAt },
    rules: filterRules,
  })

  const sorters = buildSortQuery(payload.sorters || {}, { priority: 1 })

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
        as: 'currency',
      },
    },
    {
      $lookup: {
        from: 'cashregister-accounts',
        localField: 'cashregisterAccount',
        foreignField: '_id',
        as: 'cashregisterAccount',
      },
    },
    {
      $lookup: {
        from: 'cashregisters',
        localField: 'cashregister',
        foreignField: '_id',
        as: 'cashregister',
      },
    },
    {
      $lookup: {
        from: 'expense-categories',
        localField: 'categories',
        foreignField: '_id',
        as: 'categories',
      },
    },
    {
      $addFields: {
        currency: {
          $arrayElemAt: ['$currency', 0],
        },
        cashregisterAccount: {
          $arrayElemAt: ['$cashregisterAccount', 0],
        },
        cashregister: {
          $arrayElemAt: ['$cashregister', 0],
        },
        categories: {
          $map: {
            input: '$categories',
            as: 'cat',
            in: {
              id: '$$cat._id',
              names: '$$cat.names',
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        amount: 1,
        currency: {
          id: '$currency._id',
          names: 1,
          symbols: 1,
        },
        cashregister: {
          id: '$cashregister._id',
          names: 1,
          priority: 1,
          active: 1,
        },
        cashregisterAccount: {
          id: '$cashregisterAccount._id',
          names: 1,
          priority: 1,
          active: 1,
        },
        categories: 1,
        sourceModel: 1,
        sourceId: 1,
        type: 1,
        comment: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $facet: {
        expenses: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const expensesRaw = await ExpenseModel.aggregate(pipeline).exec()

  const expenses = expensesRaw[0].expenses
  const expensesCount = expensesRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'EXPENSES_FETCHED', message: 'Expenses fetched', expenses, expensesCount }
}

export async function create(payload: ExpenseTypes.createExpenseParams): Promise<ExpenseTypes.createExpenseResult> {
  const expense = await ExpenseModel.create(payload)

  await MoneyTransactionService.create({
    type: 'expense',
    direction: 'out',
    account: payload.cashregisterAccount,
    cashregister: payload.cashregister,
    sourceModel: 'expense',
    sourceId: expense.id,
    currency: payload.currency,
    amount: payload.amount,
    description: `Expense ${expense.id}`,
  })

  return { status: 'success', code: 'EXPENSE_CREATED', message: 'Expense created', expense }
}

export async function edit(payload: ExpenseTypes.editExpenseParams): Promise<ExpenseTypes.editExpenseResult> {
  const { id } = payload

  const oldExpense = await ExpenseModel.findById(id)

  const expense = await ExpenseModel.findOneAndUpdate({ _id: id }, payload)

  if (!expense || !oldExpense) {
    throw new HttpError(400, 'Expense not edited', 'EXPENSE_NOT_EDITED')
  }

  await MoneyTransactionService.create({
    type: 'expense',
    direction: 'in',
    account: oldExpense.cashregisterAccount,
    cashregister: oldExpense.cashregister,
    sourceModel: 'expense',
    sourceId: id,
    currency: oldExpense.currency,
    amount: oldExpense.amount,
    description: `Expense edited ${id}`,
  })

  await MoneyTransactionService.create({
    type: 'expense',
    direction: 'out',
    account: payload.cashregisterAccount,
    cashregister: payload.cashregister,
    sourceModel: 'expense',
    sourceId: id,
    currency: payload.currency,
    amount: payload.amount,
    description: `Expense ${id}`,
  })

  return { status: 'success', code: 'EXPENSE_EDITED', message: 'Expense edited', expense }
}

export async function remove(payload: ExpenseTypes.removeExpensesParams): Promise<ExpenseTypes.removeExpensesResult> {
  const { ids } = payload

  await ExpenseModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  for (const id of ids) {
    const expense = await ExpenseModel.findById(id)

    if (!expense) {
      throw new HttpError(400, 'Expense not removed', 'EXPENSE_NOT_REMOVED')
    }

    await MoneyTransactionService.create({
      type: 'expense',
      direction: 'in',
      account: expense.cashregisterAccount,
      cashregister: expense.cashregister,
      sourceModel: 'expense',
      sourceId: expense.id,
      currency: expense.currency,
      amount: expense.amount,
      description: `Expense removed ${expense.id}`,
    })
  }

  return { status: 'success', code: 'EXPENSES_REMOVED', message: 'Expenses removed' }
}
