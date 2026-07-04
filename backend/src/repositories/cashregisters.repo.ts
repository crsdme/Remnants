import type { AggregateResult, CashregisterPopulatedDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type { CreateCashregistersRepoPayload, EditCashregistersRepoPayload, GetCashregistersRepoPayload } from '@/types'
import { CashregisterModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetCashregistersRepoPayload): Promise<{ items: CashregisterPopulatedDTO[], total: number, page: number, pageSize: number }> {
  const {
    current = 1,
    pageSize = 10,
  } = payload.pagination

  const {
    names,
    language,
    active,
    priority,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { names, active, priority, createdAt, updatedAt },
    rules: {
      names: { type: 'string', langAware: true },
      active: { type: 'array' },
      priority: { type: 'exact' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
    language,
  })

  const sorters = buildSortQuery(payload.sorters, { priority: 1 })

  const pipeline: PipelineStage[] = [
    { $match: query },
    { $sort: sorters },
    {
      $lookup: {
        from: 'cashregister-accounts',
        localField: 'accounts',
        foreignField: '_id',
        as: 'account',
      },
    },
    {
      $unwind: {
        path: '$account',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'money-transactions',
        let: { accountId: '$account._id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$accountId', '$$accountId'] },
            },
          },
          {
            $project: {
              currencyId: 1,
              amount: {
                $cond: [
                  { $eq: ['$direction', 'in'] },
                  '$minorAmount',
                  { $multiply: ['$minorAmount', -1] },
                ],
              },
            },
          },
          {
            $group: {
              _id: '$currencyId',
              amount: { $sum: '$amount' },
            },
          },
        ],
        as: 'transactionBalances',
      },
    },
    {
      $addFields: {
        currencies: {
          $map: {
            input: '$account.currencies',
            as: 'accCurrency',
            in: {
              $let: {
                vars: {
                  found: {
                    $first: {
                      $filter: {
                        input: '$transactionBalances',
                        as: 'txn',
                        cond: { $eq: ['$$txn._id', '$$accCurrency'] },
                      },
                    },
                  },
                },
                in: {
                  currency: '$$accCurrency',
                  amount: { $ifNull: ['$$found.amount', 0] },
                },
              },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'currencies',
        localField: 'currencies.currency',
        foreignField: '_id',
        as: 'currencyData',
      },
    },
    {
      $addFields: {
        currencies: {
          $map: {
            input: '$currencies',
            as: 'curr',
            in: {
              $let: {
                vars: {
                  currencyInfo: {
                    $first: {
                      $filter: {
                        input: '$currencyData',
                        as: 'c',
                        cond: { $eq: ['$$c._id', '$$curr.currency'] },
                      },
                    },
                  },
                },
                in: {
                  id: '$$curr.currency',
                  names: '$$currencyInfo.names',
                  symbols: '$$currencyInfo.symbols',
                  balance: {
                    $divide: [
                      '$$curr.amount',
                      { $pow: [10, { $ifNull: ['$$currencyInfo.scale', 2] }] },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: '$_id',
        names: { $first: '$names' },
        priority: { $first: '$priority' },
        active: { $first: '$active' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        accounts: {
          $push: {
            $cond: [
              { $ne: ['$currencies', null] },
              {
                id: '$account._id',
                seq: '$account.seq',
                names: '$account.names',
                priority: '$account.priority',
                active: '$account.active',
                currencies: '$currencies',
              },
              '$$REMOVE',
            ],
          },
        },

      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        names: 1,
        priority: 1,
        active: 1,
        accounts: 1,
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
        count: [{ $count: 'count' }],
      },
    },
  ]

  const raw = await CashregisterModel.aggregate<AggregateResult<CashregisterPopulatedDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateCashregistersRepoPayload) {
  return CashregisterModel.create(payload)
}

export async function updateById(id: string, payload: EditCashregistersRepoPayload) {
  return CashregisterModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function removeById(id: string) {
  return CashregisterModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
