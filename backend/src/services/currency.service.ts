import type * as CurrencyTypes from '../types/currency.type'
import { CurrencyModel, ExchangeRateModel } from '../models/'
import { HttpError } from '../utils/httpError'
import {
  extractLangMap,
  parseFile,
  toBoolean,
  toNumber,
} from '../utils/parseTools'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: CurrencyTypes.getCurrenciesParams): Promise<CurrencyTypes.getCurrenciesResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    ids = [],
    names = '',
    symbols = '',
    language = 'en',
    active = undefined,
    priority = undefined,
    cashregisterAccount = [],
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
    symbols: { type: 'string', langAware: true },
    active: { type: 'array' },
    priority: { type: 'exact' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { _id: ids, names, symbols, active, priority, createdAt, updatedAt },
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
    ...(cashregisterAccount.length > 0
      ? [{ $match: { 'matchedCashregisterAccounts.0': { $exists: true } } }]
      : []),
    {
      $project: {
        _id: 0,
        id: '$_id',
        names: 1,
        symbols: 1,
        active: 1,
        priority: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $facet: {
        currencies: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const currenciesRaw = await CurrencyModel.aggregate(pipeline).exec()

  const currencies = currenciesRaw[0].currencies
  const currenciesCount = currenciesRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'CURRENCIES_FETCHED', message: 'Currencies fetched', currencies, currenciesCount }
}

export async function getExchangeRates(payload: CurrencyTypes.getExchangeRatesParams): Promise<CurrencyTypes.getExchangeRatesResult> {
  const {
    ids = [],
    fromCurrency = '',
    toCurrency = '',
  } = payload.filters || {}

  const filterRules = {
    _id: { type: 'array' },
    fromCurrency: { type: 'exact' },
    toCurrency: { type: 'exact' },
  } as const

  const query = buildQuery({
    filters: { _id: ids, fromCurrency, toCurrency },
    rules: filterRules,
  })

  const pipeline = [
    {
      $match: query,
    },
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
        },
        toCurrency: {
          id: '$toCurrency._id',
          names: '$toCurrency.names',
          symbols: '$toCurrency.symbols',
        },
        rate: 1,
        comment: 1,
        removed: 1,
      },
    },
  ]

  const exchangeRatesRaw = await ExchangeRateModel.aggregate(pipeline).exec()

  const exchangeRates = exchangeRatesRaw

  console.log(exchangeRatesRaw)

  return { status: 'success', code: 'CURRENCIES_FETCHED', message: 'Currencies fetched', exchangeRates }
}

export async function create(payload: CurrencyTypes.createCurrencyParams): Promise<CurrencyTypes.createCurrenciesResult> {
  const currencies = await CurrencyModel.find({})

  const currency = await CurrencyModel.create(payload)

  const exchangeRates = []

  for (const other of currencies) {
    exchangeRates.push(
      {
        fromCurrency: currency._id,
        toCurrency: other._id,
        rate: 1,
        comment: 'Auto-created on currency creation',
      },
      {
        fromCurrency: other._id,
        toCurrency: currency._id,
        rate: 1,
        comment: 'Auto-created on currency creation',
      },
    )
  }

  if (exchangeRates.length > 0)
    await ExchangeRateModel.insertMany(exchangeRates)

  return { status: 'success', code: 'CURRENCY_CREATED', message: 'Currency created', currency }
}

export async function edit(payload: CurrencyTypes.editCurrencyParams): Promise<CurrencyTypes.editCurrencyResult> {
  const { id } = payload

  const currency = await CurrencyModel.findOneAndUpdate({ _id: id }, payload)

  if (!currency) {
    throw new HttpError(400, 'Currency not edited', 'CURRENCY_NOT_EDITED')
  }

  return { status: 'success', code: 'CURRENCY_EDITED', message: 'Currency edited', currency }
}

export async function editExchangeRate(payload: CurrencyTypes.editExchangeRateParams): Promise<CurrencyTypes.editExchangeRateResult> {
  const { id } = payload

  const exchangeRate = await ExchangeRateModel.findOneAndUpdate({ _id: id }, { $set: payload })

  if (!exchangeRate) {
    throw new HttpError(400, 'Exchange rate not edited', 'EXCHANGE_RATE_NOT_EDITED')
  }

  return { status: 'success', code: 'EXCHANGE_RATE_EDITED', message: 'Exchange rate edited', exchangeRate }
}

export async function remove(payload: CurrencyTypes.removeCurrenciesParams): Promise<CurrencyTypes.removeCurrenciesResult> {
  const { ids } = payload

  const currencies = await CurrencyModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  await ExchangeRateModel.updateMany(
    {
      $or: [
        { fromCurrency: { $in: ids } },
        { toCurrency: { $in: ids } },
      ],
    },
    { $set: { removed: true } },
  )

  if (!currencies) {
    throw new HttpError(400, 'Currencies not removed', 'CURRENCIES_NOT_REMOVED')
  }

  return { status: 'success', code: 'CURRENCIES_REMOVED', message: 'Currencies removed' }
}

export async function batch(payload: CurrencyTypes.batchCurrenciesParams): Promise<CurrencyTypes.batchCurrenciesResult> {
  const { ids, filters, params } = payload

  const {
    names = '',
    symbols = '',
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
  } = filters || {}

  const allowedParams = ['names', 'symbols', 'priority', 'active']

  const batchParams = params
    .filter(item => item.column && item.value && allowedParams.includes(item.column))
    .map(item => ({ [`${item.column}`]: item.value }))

  const mergedBatchParams = Object.assign({}, ...batchParams)

  const filterRules = {
    names: { type: 'string', langAware: true },
    symbols: { type: 'string', langAware: true },
    active: { type: 'array' },
    priority: { type: 'exact' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { names, symbols, active, priority, createdAt, updatedAt },
    rules: filterRules,
    language,
    batch: { ids: ids && ids.map(id => id.toString()) },
  })

  const currencies = await CurrencyModel.updateMany(
    query,
    { $set: mergedBatchParams },
  )

  if (!currencies) {
    throw new HttpError(400, 'Currencies not batch edited', 'CURRENCIES_NOT_BATCH_EDITED')
  }

  return { status: 'success', code: 'CURRENCIES_BATCH_EDITED', message: 'Currencies batch edited' }
}

export async function importHandler(payload: CurrencyTypes.importCurrenciesParams): Promise<CurrencyTypes.importCurrenciesResult> {
  const { file } = payload

  const storedFile = await parseFile(file.path)

  const parsedCurrencies = storedFile.map(row => ({
    names: extractLangMap(row, 'names'),
    symbols: extractLangMap(row, 'symbols'),
    priority: toNumber(row.priority),
    active: toBoolean(row.active),
  }))

  const currencies = await CurrencyModel.create(parsedCurrencies)

  const currencyIds = currencies.map(currency => currency._id)

  return { status: 'success', code: 'CURRENCIES_IMPORTED', message: 'Currencies imported', currencyIds }
}

export async function duplicate(payload: CurrencyTypes.duplicateCurrencyParams): Promise<CurrencyTypes.duplicateCurrencyResult> {
  const { ids } = payload

  const currencies = await CurrencyModel.find({ _id: { $in: ids } })

  const parsedCurrencies = currencies.map(currency => ({
    names: currency.names,
    symbols: currency.symbols,
    priority: currency.priority,
    active: currency.active,
  }))

  await CurrencyModel.create(parsedCurrencies)

  return { status: 'success', code: 'CURRENCIES_DUPLICATED', message: 'Currencies duplicated' }
}
