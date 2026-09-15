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

function projectUser(field: string) {
  return {
    $cond: [
      { $gt: [{ $size: { $ifNull: [`$${field}`, []] } }, 0] },
      {
        $let: {
          vars: { user: { $arrayElemAt: [`$${field}`, 0] } },
          in: {
            id: { $toString: '$$user._id' },
            name: { $ifNull: ['$$user.name', ''] },
          },
        },
      },
      null,
    ],
  }
}

const populateStages: PipelineStage[] = [
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
    $lookup: {
      from: 'users',
      localField: 'createdBy',
      foreignField: '_id',
      as: 'createdByUser',
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: 'confirmedBy',
      foreignField: '_id',
      as: 'confirmedByUser',
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: 'cancelledBy',
      foreignField: '_id',
      as: 'cancelledByUser',
    },
  },
  {
    $lookup: {
      from: 'money-transactions',
      localField: 'transferId',
      foreignField: 'transferId',
      as: 'transferLegs',
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
      minorBalanceBefore: 1,
      minorBalanceAfter: 1,
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
      confirmedAt: 1,
      cancelled: 1,
      cancelledAt: 1,
      createdBy: projectUser('createdByUser'),
      confirmedBy: projectUser('confirmedByUser'),
      cancelledBy: projectUser('cancelledByUser'),
      awaitingReceive: {
        $and: [
          { $eq: ['$type', 'transfer'] },
          { $ne: ['$cancelled', true] },
          {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: { $ifNull: ['$transferLegs', []] },
                    as: 'leg',
                    cond: {
                      $and: [
                        { $eq: ['$$leg.role', 'to'] },
                        { $ne: ['$$leg.confirmed', true] },
                        { $ne: ['$$leg.cancelled', true] },
                      ],
                    },
                  },
                },
              },
              0,
            ],
          },
        ],
      },
      createdAt: 1,
      updatedAt: 1,
      description: 1,
    },
  },
]

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
    confirmed,
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
      confirmed,
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
      confirmed: { type: 'array' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
    removed: false,
  })

  applyScopeIdsToQuery(query, options.cashregisterIds, 'cashregisterId')
  applyScopeIdsToQuery(query, options.cashregisterAccountIds, 'accountId')

  const sorters = buildSortQuery(payload.sorters, { createdAt: -1 })

  const pipeline: PipelineStage[] = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    ...populateStages,
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

export async function getById({
  id,
  session,
}: {
  id: string
  session?: ClientSession
}): Promise<MoneyTransactionPopulated | null> {
  const pipeline: PipelineStage[] = [
    {
      $match: { _id: id },
    },
    ...populateStages,
  ]

  const aggregate = MoneyTransactionModel.aggregate<MoneyTransactionPopulated>(pipeline)
  if (session)
    aggregate.session(session)

  const [doc] = await aggregate.exec()
  return doc ?? null
}

export async function getAccountCurrencyMinorBalance({
  accountId,
  currencyId,
  session,
}: {
  accountId: string
  currencyId: string
  session?: ClientSession
}): Promise<number> {
  const pipeline: PipelineStage[] = [
    {
      $match: {
        accountId,
        currencyId,
        $expr: {
          $and: [
            { $ne: ['$cancelled', true] },
            {
              $or: [
                { $ne: ['$$CURRENT.type', 'transfer'] },
                { $ne: ['$direction', 'in'] },
                { $eq: ['$confirmed', true] },
              ],
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        amount: {
          $sum: {
            $cond: [
              { $eq: ['$direction', 'in'] },
              '$minorAmount',
              { $multiply: ['$minorAmount', -1] },
            ],
          },
        },
      },
    },
  ]

  const aggregate = MoneyTransactionModel.aggregate<{ amount: number }>(pipeline)
  if (session)
    aggregate.session(session)

  const [doc] = await aggregate.exec()
  return doc?.amount ?? 0
}

export async function createOne({ payload, session }: { payload: CreateMoneyTransactionsRepoPayload, session?: ClientSession }) {
  return MoneyTransactionModel.create([payload], { session })
}

export interface MoneyTransactionTransferLeg {
  _id: string
  type: string
  role?: string | null
  confirmed?: boolean
  cancelled?: boolean
  accountId: string
  direction: 'in' | 'out'
  currencyId: string
  minorAmount: number
}

export async function findByTransferId({
  transferId,
  session,
}: {
  transferId: string
  session?: ClientSession
}): Promise<MoneyTransactionTransferLeg[]> {
  const query = MoneyTransactionModel.find({ transferId, removed: { $ne: true } }).select({
    type: 1,
    role: 1,
    confirmed: 1,
    cancelled: 1,
    accountId: 1,
    direction: 1,
    currencyId: 1,
    minorAmount: 1,
  })
  if (session)
    query.session(session)

  return query.lean().exec() as unknown as Promise<MoneyTransactionTransferLeg[]>
}

export async function updateById({
  id,
  payload,
  session,
}: {
  id: string
  payload: {
    confirmed?: boolean
    confirmedBy?: string | null
    confirmedAt?: Date | null
    cancelled?: boolean
    cancelledBy?: string | null
    cancelledAt?: Date | null
    minorBalanceBefore?: number | null
    minorBalanceAfter?: number | null
  }
  session?: ClientSession
}) {
  return MoneyTransactionModel.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, session },
  ).lean().exec()
}
