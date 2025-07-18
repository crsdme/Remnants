import type * as CashregisterAccountTypes from '../types/cashregister-account.type'
import { CashregisterAccountModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: CashregisterAccountTypes.getCashregisterAccountsParams): Promise<CashregisterAccountTypes.getCashregisterAccountsResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    ids = [],
    names = '',
    language = 'en',
    active = undefined,
    priority = undefined,
    cashregister = [],
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
    active: { type: 'array' },
    priority: { type: 'exact' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { _id: ids, names, active, priority, createdAt, updatedAt },
    rules: filterRules,
    language,
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

  const cashregisterAccountsRaw = await CashregisterAccountModel.aggregate(pipeline).exec()

  const cashregisterAccounts = cashregisterAccountsRaw[0].cashregisterAccounts
  const cashregisterAccountsCount = cashregisterAccountsRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'CASHREGISTER_ACCOUNTS_FETCHED', message: 'Cashregister accounts fetched', cashregisterAccounts, cashregisterAccountsCount }
}

export async function create(payload: CashregisterAccountTypes.createCashregisterAccountParams): Promise<CashregisterAccountTypes.createCashregisterAccountResult> {
  const cashregisterAccount = await CashregisterAccountModel.create(payload)

  return { status: 'success', code: 'CASHREGISTER_ACCOUNT_CREATED', message: 'Cashregister account created', cashregisterAccount }
}

export async function edit(payload: CashregisterAccountTypes.editCashregisterAccountParams): Promise<CashregisterAccountTypes.editCashregisterAccountResult> {
  const { id } = payload

  const cashregisterAccount = await CashregisterAccountModel.findOneAndUpdate({ _id: id }, payload)

  if (!cashregisterAccount) {
    throw new HttpError(400, 'Cashregister account not edited', 'CASHREGISTER_ACCOUNT_NOT_EDITED')
  }

  return { status: 'success', code: 'CASHREGISTER_ACCOUNT_EDITED', message: 'Cashregister account edited', cashregisterAccount }
}

export async function remove(payload: CashregisterAccountTypes.removeCashregisterAccountsParams): Promise<CashregisterAccountTypes.removeCashregisterAccountsResult> {
  const { ids } = payload

  const cashregisterAccounts = await CashregisterAccountModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!cashregisterAccounts) {
    throw new HttpError(400, 'Cashregister accounts not removed', 'CASHREGISTER_ACCOUNTS_NOT_REMOVED')
  }

  return { status: 'success', code: 'CASHREGISTER_ACCOUNTS_REMOVED', message: 'Cashregister accounts removed' }
}
