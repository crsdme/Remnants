import type { AggregateResult } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateExpensesRepoPayload,
  EditExpensesRepoPayload,
  ExpenseDBPopulated,
  GetExpensesRepoPayload,
  GetExpensesRepoResult,
} from '@/types/'
import { ExpenseModel } from '@/models'
import { applyScopeIdsToQuery, buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(
  payload: GetExpensesRepoPayload,
  options: {
    categoryIds?: string[] | null
    cashregisterIds?: string[] | null
    cashregisterAccountIds?: string[] | null
  } = {},
): Promise<GetExpensesRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    ids,
    seq,
    amount,
    currency,
    cashregister,
    cashregisterAccount,
    sourceModel,
    sourceId,
    type,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: {
      _id: ids,
      seq,
      amount,
      currency,
      cashregisterId: cashregister,
      cashregisterAccountId: cashregisterAccount,
      sourceModel,
      sourceId,
      type,
      createdAt,
      updatedAt,
    },
    rules: {
      _id: { type: 'array' },
      seq: { type: 'exact' },
      amount: { type: 'exact' },
      currency: { type: 'exact' },
      cashregisterId: { type: 'exact' },
      cashregisterAccountId: { type: 'exact' },
      sourceModel: { type: 'exact' },
      sourceId: { type: 'exact' },
      type: { type: 'exact' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
  })

  applyScopeIdsToQuery(query, options.categoryIds, 'categoryIds')
  applyScopeIdsToQuery(query, options.cashregisterIds, 'cashregisterId')
  applyScopeIdsToQuery(query, options.cashregisterAccountIds, 'cashregisterAccountId')

  const sorters = buildSortQuery(payload.sorters, { seq: 1 })

  const pipeline: PipelineStage[] = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $lookup: {
        from: 'currencies',
        localField: 'currencyId',
        foreignField: '_id',
        as: 'currency',
      },
    },
    {
      $lookup: {
        from: 'cashregister-accounts',
        localField: 'cashregisterAccountId',
        foreignField: '_id',
        as: 'cashregisterAccount',
      },
    },
    {
      $lookup: {
        from: 'cashregisters',
        localField: 'cashregisterId',
        foreignField: '_id',
        as: 'cashregister',
      },
    },
    {
      $lookup: {
        from: 'expense-categories',
        localField: 'categoryIds',
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
        seq: 1,
        minorAmount: 1,
        currency: {
          id: '$currency._id',
          names: 1,
          symbols: 1,
          scale: 1,
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
        items: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        count: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await ExpenseModel.aggregate<AggregateResult<ExpenseDBPopulated>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateExpensesRepoPayload) {
  return ExpenseModel.create(payload)
}

export async function updateById(id: string, payload: EditExpensesRepoPayload) {
  return ExpenseModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function findById(id: string) {
  return ExpenseModel.findById(id).exec()
}

export async function removeById(id: string) {
  return ExpenseModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
