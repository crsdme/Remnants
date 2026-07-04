import type { AggregateResult, CurrencyDTO, ExchangeRateDTOPopulated } from '@remnant/shared'
import type { FilterQuery, PipelineStage } from 'mongoose'
import type {
  CreateCurrenciesRepoPayload,
  CurrencyDB,
  EditCurrenciesRepoPayload,
  EditExchangeRatesRepoPayload,
  GetCurrenciesRepoPayload,
  GetCurrenciesRepoResult,
  GetExchangeRatesRepoPayload,
  GetExchangeRatesRepoResult,
} from '@/types'
import { CashregisterModel, CurrencyModel, ExchangeRateModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetCurrenciesRepoPayload): Promise<GetCurrenciesRepoResult> {
  const {
    current = 1,
    pageSize = 10,
  } = payload.pagination

  const {
    ids,
    names,
    symbols,
    language,
    active,
    priority,
    cashregisterAccount,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { _id: ids, names, symbols, active, priority, createdAt, updatedAt },
    rules: {
      _id: { type: 'array' },
      names: { type: 'string', langAware: true },
      symbols: { type: 'string', langAware: true },
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
        let: { currencyId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $isArray: '$currencies' },
                  { $in: ['$$currencyId', '$currencies'] },
                ],
              },
              ...(Array.isArray(cashregisterAccount) && cashregisterAccount.length > 0
                ? { _id: { $in: cashregisterAccount } }
                : {}),
            },
          },
          { $project: { _id: 1 } },
        ],
        as: 'matchedCashregisterAccounts',
      },
    },
    ...(Array.isArray(cashregisterAccount) && cashregisterAccount?.length > 0
      ? [{ $match: { 'matchedCashregisterAccounts.0': { $exists: true } } }]
      : []),
    {
      $project: {
        _id: 0,
        id: '$_id',
        names: 1,
        symbols: 1,
        scale: 1,
        paymentEpsilon: {
          $ifNull: [
            '$paymentEpsilon',
            { $pow: [10, { $subtract: [1, { $ifNull: ['$scale', 2] }] }] },
          ],
        },
        active: 1,
        priority: 1,
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

  const raw = await CurrencyModel.aggregate<AggregateResult<CurrencyDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateCurrenciesRepoPayload) {
  return CashregisterModel.create(payload)
}

export async function updateById(id: string, payload: EditCurrenciesRepoPayload) {
  return CashregisterModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function findOne(payload: FilterQuery<CurrencyDB>) {
  return CurrencyModel.findOne(payload).exec()
}

export async function removeById(id: string) {
  return CashregisterModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}

export async function listExchangeRates(payload: GetExchangeRatesRepoPayload): Promise<GetExchangeRatesRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    ids,
    fromCurrency,
    toCurrency,
  } = payload.filters

  const query = buildQuery({
    filters: { _id: ids, fromCurrency, toCurrency },
    rules: {
      _id: { type: 'array' },
      fromCurrency: { type: 'exact' },
      toCurrency: { type: 'exact' },
    },
  })

  const sorters = buildSortQuery(payload.sorters, { priority: 1 })

  const pipeline: PipelineStage[] = [
    { $match: query },
    { $sort: sorters },
    {
      $lookup: {
        from: 'currencies',
        localField: 'fromCurrency',
        foreignField: '_id',
        as: 'fromCurrency',
      },
    },
    {
      $lookup: {
        from: 'currencies',
        localField: 'toCurrency',
        foreignField: '_id',
        as: 'toCurrency',
      },
    },
    {
      $unwind: '$fromCurrency',
    },
    {
      $unwind: '$toCurrency',
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        fromCurrency: {
          id: '$fromCurrency._id',
          names: '$fromCurrency.names',
          symbols: '$fromCurrency.symbols',
          scale: { $ifNull: ['$fromCurrency.scale', 2] },
          paymentEpsilon: {
            $ifNull: [
              '$fromCurrency.paymentEpsilon',
              { $pow: [10, { $subtract: [1, { $ifNull: ['$fromCurrency.scale', 2] }] }] },
            ],
          },
          priority: { $ifNull: ['$fromCurrency.priority', 0] },
          active: { $ifNull: ['$fromCurrency.active', true] },
        },
        toCurrency: {
          id: '$toCurrency._id',
          names: '$toCurrency.names',
          symbols: '$toCurrency.symbols',
          scale: { $ifNull: ['$toCurrency.scale', 2] },
          paymentEpsilon: {
            $ifNull: [
              '$toCurrency.paymentEpsilon',
              { $pow: [10, { $subtract: [1, { $ifNull: ['$toCurrency.scale', 2] }] }] },
            ],
          },
          priority: { $ifNull: ['$toCurrency.priority', 0] },
          active: { $ifNull: ['$toCurrency.active', true] },
        },
        rate: 1,
        comment: 1,
        removed: 1,
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

  const raw = await ExchangeRateModel.aggregate<AggregateResult<ExchangeRateDTOPopulated>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function updateExchangeRateById(id: string, payload: EditExchangeRatesRepoPayload) {
  return ExchangeRateModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}
