import type * as ExpenseCategoryTypes from '../types/expense-category.type'
import { ExpenseCategoryModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: ExpenseCategoryTypes.getExpenseCategoriesParams): Promise<ExpenseCategoryTypes.getExpenseCategoriesResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    ids = [],
    names = undefined,
    color = undefined,
    priority = undefined,
    comment = undefined,
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
    names: { type: 'string', langAware: true },
    color: { type: 'exact' },
    priority: { type: 'exact' },
    comment: { type: 'exact' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { ids, names, color, priority, comment, createdAt, updatedAt },
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
      $project: {
        _id: 0,
        id: '$_id',
        seq: 1,
        names: 1,
        color: 1,
        priority: 1,
        comment: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $facet: {
        expenseCategories: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const expenseCategoriesRaw = await ExpenseCategoryModel.aggregate(pipeline).exec()

  const expenseCategories = expenseCategoriesRaw[0].expenseCategories
  const expenseCategoriesCount = expenseCategoriesRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'EXPENSE_CATEGORIES_FETCHED', message: 'Expense categories fetched', expenseCategories, expenseCategoriesCount }
}

export async function create(payload: ExpenseCategoryTypes.createExpenseCategoryParams): Promise<ExpenseCategoryTypes.createExpenseCategoryResult> {
  const expenseCategory = await ExpenseCategoryModel.create(payload)

  return { status: 'success', code: 'EXPENSE_CATEGORY_CREATED', message: 'Expense category created', expenseCategory }
}

export async function edit(payload: ExpenseCategoryTypes.editExpenseCategoryParams): Promise<ExpenseCategoryTypes.editExpenseCategoryResult> {
  const { id } = payload

  const expenseCategory = await ExpenseCategoryModel.findOneAndUpdate({ _id: id }, payload)

  if (!expenseCategory) {
    throw new HttpError(400, 'Expense category not edited', 'EXPENSE_CATEGORY_NOT_EDITED')
  }

  return { status: 'success', code: 'EXPENSE_CATEGORY_EDITED', message: 'Expense category edited', expenseCategory }
}

export async function remove(payload: ExpenseCategoryTypes.removeExpenseCategoriesParams): Promise<ExpenseCategoryTypes.removeExpenseCategoriesResult> {
  const { ids } = payload

  const expenseCategories = await ExpenseCategoryModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!expenseCategories) {
    throw new HttpError(400, 'Expense categories not removed', 'EXPENSE_CATEGORIES_NOT_REMOVED')
  }

  return { status: 'success', code: 'EXPENSE_CATEGORIES_REMOVED', message: 'Expense categories removed' }
}
