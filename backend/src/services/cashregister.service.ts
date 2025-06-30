import type * as CashregisterTypes from '../types/cashregister.type'
import { CashregisterModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: CashregisterTypes.getCashregistersParams): Promise<CashregisterTypes.getCashregistersResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    names = '',
    language = 'en',
    active = undefined,
    priority = undefined,
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
    names: { type: 'string', langAware: true },
    active: { type: 'array' },
    priority: { type: 'exact' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { names, active, priority, createdAt, updatedAt },
    rules: filterRules,
    language,
  })

  const sorters = buildSortQuery(payload.sorters || {}, { priority: 1 })

  const pipeline = [
    { $match: query },
    { $sort: sorters },
    {
      $unwind: {
        path: '$account',
        preserveNullAndEmptyArrays: true,
      },
    },
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
              $expr: { $eq: ['$account', '$$accountId'] },
            },
          },
          {
            $project: {
              currency: 1,
              amount: {
                $cond: [
                  { $eq: ['$direction', 'in'] },
                  '$amount',
                  { $multiply: ['$amount', -1] },
                ],
              },
            },
          },
          {
            $group: {
              _id: '$currency',
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
                  balance: '$$curr.amount',
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
                names: '$account.names',
                priority: '$account.priority',
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
        createdAt: 1,
        updatedAt: 1,
        accounts: 1,
      },
    },
    {
      $facet: {
        cashregisters: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]

  // const pipeline = [
  //   { $match: query },
  //   { $sort: sorters },
  //   { $unwind: '$accounts' },
  //   {
  //     $lookup: {
  //       from: 'money-transactions',
  //       localField: 'accounts',
  //       foreignField: 'accountId',
  //       as: 'moneyTransactions',
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'cashregister-accounts',
  //       localField: 'accounts',
  //       foreignField: '_id',
  //       as: 'account',
  //     },
  //   },
  //   // {
  //   //   $lookup: {
  //   //     from: 'currencies',
  //   //     localField: 'account.currency',
  //   //     foreignField: '_id',
  //   //     as: 'currency',
  //   //   },
  //   // },
  //   // {
  //   //   $addFields: {
  //   //     balance: {
  //   //       $sum: {
  //   //         $map: {
  //   //           input: '$moneyTransactions',
  //   //           as: 'txn',
  //   //           in: {
  //   //             $cond: [
  //   //               { $eq: ['$$txn.direction', 'in'] },
  //   //               '$$txn.amount',
  //   //               { $multiply: ['$$txn.amount', -1] },
  //   //             ],
  //   //           },
  //   //         },
  //   //       },
  //   //     },
  //   //   },
  //   // },
  //   // {
  //   //   $group: {
  //   //     _id: '$_id',
  //   //     names: { $first: '$names' },
  //   //     priority: { $first: '$priority' },
  //   //     active: { $first: '$active' },
  //   //     createdAt: { $first: '$createdAt' },
  //   //     updatedAt: { $first: '$updatedAt' },
  //   //     accounts: {
  //   //       $push: {
  //   //         id: '$accounts',
  //   //         names: { $arrayElemAt: ['$account.names', 0] }, // account — массив после lookup
  //   //         currency: {
  //   //           id: { $arrayElemAt: ['$currency._id', 0] },
  //   //           names: { $arrayElemAt: ['$currency.names', 0] },
  //   //           symbols: { $arrayElemAt: ['$currency.symbols', 0] },
  //   //         },
  //   //         balance: '$balance',
  //   //       },
  //   //     },
  //   //   },
  //   // },
  //   // {
  //   //   $project: {
  //   //     _id: 0,
  //   //     id: '$_id',
  //   //     names: 1,
  //   //     priority: 1,
  //   //     active: 1,
  //   //     createdAt: 1,
  //   //     updatedAt: 1,
  //   //     accounts: 1,
  //   //   },
  //   // },
  //   {
  //     $facet: {
  //       cashregisters: [
  //         { $skip: (current - 1) * pageSize },
  //         { $limit: pageSize },
  //       ],
  //       totalCount: [{ $count: 'count' }],
  //     },
  //   },
  // ]

  // const pipeline = [
  //   { $match: query },
  //   { $sort: sorters },
  //   {
  //     $lookup: {
  //       from: 'cashregister-accounts',
  //       localField: 'accounts',
  //       foreignField: '_id',
  //       as: 'accounts',
  //     },
  //   },
  //   // 👇 Добавляем баланс каждому аккаунту
  //   {
  //     $lookup: {
  //       from: 'money-transactions',
  //       localField: 'accounts._id',
  //       foreignField: 'accountId',
  //       as: 'allMoneyTransactions',
  //     },
  //   },
  //   {
  //     $addFields: {
  //       accounts: {
  //         $map: {
  //           input: '$accounts',
  //           as: 'acc',
  //           in: {
  //             $mergeObjects: [
  //               '$$acc',
  //               {
  //                 balance: {
  //                   $sum: {
  //                     $map: {
  //                       input: {
  //                         $filter: {
  //                           input: '$allMoneyTransactions',
  //                           as: 'txn',
  //                           cond: { $eq: ['$$txn.accountId', '$$acc._id'] },
  //                         },
  //                       },
  //                       as: 'txn',
  //                       in: {
  //                         $cond: {
  //                           if: { $eq: ['$$txn.direction', 'in'] },
  //                           then: '$$txn.amount',
  //                           else: { $multiply: ['$$txn.amount', -1] },
  //                         },
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             ],
  //           },
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $project: {
  //       allMoneyTransactions: 0, // скрыть временное поле
  //     },
  //   },
  //   {
  //     $facet: {
  //       cashregisters: [
  //         { $skip: (current - 1) * pageSize },
  //         { $limit: pageSize },
  //       ],
  //       totalCount: [{ $count: 'count' }],
  //     },
  //   },
  // ]

  // const pipeline = [
  //   { $match: query },
  //   { $sort: sorters },
  //   { $unwind: '$accounts' },

  //   // 1. Получаем информацию об аккаунте
  //   {
  //     $lookup: {
  //       from: 'cashregister-accounts',
  //       localField: 'accounts',
  //       foreignField: '_id',
  //       as: 'account',
  //     },
  //   },
  //   { $unwind: '$account' },

  //   // 2. Получаем транзакции, связанные с этим аккаунтом
  //   {
  //     $lookup: {
  //       from: 'money-transactions',
  //       let: { accountId: '$account._id' },
  //       pipeline: [
  //         { $match: {
  //           $expr: { $eq: ['$accountId', '$$accountId'] },
  //         } },
  //         {
  //           $project: {
  //             amount: {
  //               $cond: [
  //                 { $eq: ['$direction', 'in'] },
  //                 '$amount',
  //                 { $multiply: ['$amount', -1] },
  //               ],
  //             },
  //             currency: 1,
  //           },
  //         },
  //       ],
  //       as: 'moneyTransactions',
  //     },
  //   },

  //   // 3. Группируем транзакции по валюте и суммируем
  //   {
  //     $addFields: {
  //       balancesByCurrency: {
  //         $map: {
  //           input: {
  //             $filter: {
  //               input: {
  //                 $reduce: {
  //                   input: '$moneyTransactions',
  //                   initialValue: [],
  //                   in: {
  //                     $let: {
  //                       vars: {
  //                         existing: {
  //                           $filter: {
  //                             input: '$$value',
  //                             as: 'b',
  //                             cond: { $eq: ['$$b.currency', '$$this.currency'] },
  //                           },
  //                         },
  //                       },
  //                       in: {
  //                         $cond: [
  //                           { $gt: [{ $size: '$$existing' }, 0] },
  //                           {
  //                             $map: {
  //                               input: '$$value',
  //                               as: 'b',
  //                               in: {
  //                                 $cond: [
  //                                   { $eq: ['$$b.currency', '$$this.currency'] },
  //                                   {
  //                                     currency: '$$b.currency',
  //                                     amount: { $add: ['$$b.amount', '$$this.amount'] },
  //                                   },
  //                                   '$$b',
  //                                 ],
  //                               },
  //                             },
  //                           },
  //                           { $concatArrays: ['$$value', [{ currency: '$$this.currency', amount: '$$this.amount' }]] },
  //                         ],
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //               as: 'item',
  //               cond: { $ne: ['$$item.amount', 0] },
  //             },
  //           },
  //           as: 'bal',
  //           in: {
  //             currency: '$$bal.currency',
  //             amount: '$$bal.amount',
  //           },
  //         },
  //       },
  //     },
  //   },

  //   // 4. Собираем обратно в cashregister
  //   {
  //     $group: {
  //       _id: '$_id',
  //       names: { $first: '$names' },
  //       priority: { $first: '$priority' },
  //       active: { $first: '$active' },
  //       createdAt: { $first: '$createdAt' },
  //       updatedAt: { $first: '$updatedAt' },
  //       accounts: {
  //         $push: {
  //           id: '$account._id',
  //           names: '$account.names',
  //           currency: '$account.currency',
  //           balances: '$balancesByCurrency',
  //         },
  //       },
  //     },
  //   },

  //   // 5. Переименование и пагинация
  //   {
  //     $project: {
  //       _id: 0,
  //       id: '$_id',
  //       names: 1,
  //       priority: 1,
  //       active: 1,
  //       createdAt: 1,
  //       updatedAt: 1,
  //       accounts: 1,
  //     },
  //   },

  //   {
  //     $facet: {
  //       cashregisters: [
  //         { $skip: (current - 1) * pageSize },
  //         { $limit: pageSize },
  //       ],
  //       totalCount: [{ $count: 'count' }],
  //     },
  //   },
  // ]

  const cashregistersRaw = await CashregisterModel.aggregate(pipeline).exec()

  const cashregisters = cashregistersRaw[0].cashregisters
  const cashregistersCount = cashregistersRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'CASHREGISTERS_FETCHED', message: 'Cashregisters fetched', cashregisters, cashregistersCount }
}

export async function create(payload: CashregisterTypes.createCashregisterParams): Promise<CashregisterTypes.createCashregisterResult> {
  const cashregister = await CashregisterModel.create(payload)

  return { status: 'success', code: 'CASHREGISTER_CREATED', message: 'Cashregister created', cashregister }
}

export async function edit(payload: CashregisterTypes.editCashregisterParams): Promise<CashregisterTypes.editCashregisterResult> {
  const { id } = payload

  const cashregister = await CashregisterModel.findOneAndUpdate({ _id: id }, payload)

  if (!cashregister) {
    throw new HttpError(400, 'Cashregister not edited', 'CASHREGISTER_NOT_EDITED')
  }

  return { status: 'success', code: 'CASHREGISTER_EDITED', message: 'Cashregister edited', cashregister }
}

export async function remove(payload: CashregisterTypes.removeCashregistersParams): Promise<CashregisterTypes.removeCashregistersResult> {
  const { ids } = payload

  const cashregisters = await CashregisterModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!cashregisters) {
    throw new HttpError(400, 'Cashregisters not removed', 'CASHREGISTERS_NOT_REMOVED')
  }

  return { status: 'success', code: 'CASHREGISTERS_REMOVED', message: 'Cashregisters removed' }
}
