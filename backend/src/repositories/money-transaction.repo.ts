import type { AggregateResult } from '@remnant/shared'
import type { ClientSession, PipelineStage } from 'mongoose'
import type {
  CreateMoneyTransactionsRepoPayload,
  GetMoneyTransactionsRepoPayload,
  GetMoneyTransactionsRepoResult,
  MoneyTransactionPopulated,
} from '@/types/'
import { MoneyTransactionModel } from '@/models'
import { applyScopeIdsToQuery, buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list({
  payload,
  options = {},
}: {
  payload: GetMoneyTransactionsRepoPayload
  options?: {
    cashregisterIds?: string[] | null
    cashregisterAccountIds?: string[] | null
  }
}): Promise<GetMoneyTransactionsRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    type,
    direction,
    accountId,
    description,
    sourceModel,
    sourceId,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: {
      type,
      direction,
      accountId,
      description,
      sourceModel,
      sourceId,
      createdAt,
      updatedAt,
    },
    rules: {
      type: { type: 'string' },
      direction: { type: 'string' },
      accountId: { type: 'string' },
      description: { type: 'string' },
      sourceModel: { type: 'string' },
      sourceId: { type: 'string' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
    removed: false,
  })

  applyScopeIdsToQuery(query, options.cashregisterIds, 'cashregisterId')
  applyScopeIdsToQuery(query, options.cashregisterAccountIds, 'accountId')

  const sorters = buildSortQuery(payload.sorters, { createdAt: 1 })

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
        as: 'currencyData',
      },
    },
    {
      $lookup: {
        from: 'cashregister-accounts',
        localField: 'accountId',
        foreignField: '_id',
        as: 'accountData',
      },
    },
    {
      $lookup: {
        from: 'cashregisters',
        localField: 'cashregisterId',
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
        seq: 1,
        type: 1,
        direction: 1,
        minorAmount: 1,
        currency: {
          id: '$currency._id',
          names: '$currency.names',
          symbols: '$currency.symbols',
          scale: '$currency.scale',
        },
        account: {
          id: '$account._id',
          names: '$account.names',
        },
        cashregister: {
          id: '$cashregister._id',
          names: '$cashregister.names',
          priority: '$cashregister.priority',
        },
        sourceModel: 1,
        sourceId: 1,
        role: 1,
        transferId: 1,
        confirmed: 1,
        createdBy: 1,
        removedBy: 1,
        createdAt: 1,
        updatedAt: 1,
        description: 1,
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

  const raw = await MoneyTransactionModel.aggregate<AggregateResult<MoneyTransactionPopulated>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne({ payload, session }: { payload: CreateMoneyTransactionsRepoPayload, session?: ClientSession }) {
  return MoneyTransactionModel.create([payload], { session })
}
