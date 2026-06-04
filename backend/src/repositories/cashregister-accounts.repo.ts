import type { AggregateResult, CashregisterAccountDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateCashregisterAccountsRepoPayload,
  EditCashregisterAccountsRepoPayload,
  GetCashregisterAccountsRepoPayload,
} from '@/types'
import { CashregisterAccountModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetCashregisterAccountsRepoPayload): Promise<{ items: CashregisterAccountDTO[], total: number, page: number, pageSize: number }> {
  const {
    current = 1,
    pageSize = 10,
  } = payload.pagination

  const {
    ids,
    names,
    active,
    cashregister,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { _id: ids, names, active, cashregister, createdAt, updatedAt },
    rules: {
      _id: { type: 'array' },
      names: { type: 'string', langAware: true },
      active: { type: 'array' },
      cashregister: { type: 'array' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
    language: 'en',
  })

  const sorters = buildSortQuery(payload.sorters, { priority: 1 })

  const pipeline: PipelineStage[] = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $lookup: {
        from: 'cashregisters',
        let: { accountId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $in: ['$$accountId', '$accounts'] },
              ...(cashregister.length > 0 ? { _id: { $in: cashregister } } : {}),
            },
          },
          { $project: { _id: 1 } },
        ],
        as: 'matchedCashregisters',
      },
    },
    ...(cashregister.length > 0
      ? [{ $match: { 'matchedCashregisters.0': { $exists: true } } }]
      : []),
    {
      $lookup: {
        from: 'currencies',
        localField: 'currencies',
        foreignField: '_id',
        as: 'currencies',
        pipeline: [
          {
            $addFields: {
              id: '$_id',
              names: '$names',
              symbols: '$symbols',
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        seq: 1,
        names: 1,
        currencies: { id: 1, names: 1, symbols: 1 },
        priority: 1,
        active: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $facet: {
        cashregisterAccounts: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await CashregisterAccountModel.aggregate<AggregateResult<CashregisterAccountDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateCashregisterAccountsRepoPayload) {
  return CashregisterAccountModel.create(payload)
}

export async function updateById(id: string, payload: EditCashregisterAccountsRepoPayload) {
  return CashregisterAccountModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function removeById(id: string) {
  return CashregisterAccountModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
