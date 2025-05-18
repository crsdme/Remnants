import type * as CurrencyTypes from '../types/currency.type'
import { CurrencyModel } from '../models/'
import { HttpError } from '../utils/httpError'
import {
  extractLangMap,
  parseFile,
  toBoolean,
  toNumber,
} from '../utils/parseTools'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: CurrencyTypes.getCurrenciesParams): Promise<CurrencyTypes.getCurrenciesResult> {
  const { current = 1, pageSize = 10 } = payload.pagination

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
  } = payload.filters

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
  })

  const sorters = buildSortQuery(payload.sorters)

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sorters,
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

  const currencies = currenciesRaw[0].currencies.map((doc: any) => CurrencyModel.hydrate(doc))
  const currenciesCount = currenciesRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'CURRENCIES_FETCHED', message: 'Currencies fetched', currencies, currenciesCount }
}

export async function create(payload: CurrencyTypes.createCurrencyParams): Promise<CurrencyTypes.createCurrenciesResult> {
  const currency = await CurrencyModel.create(payload)

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

export async function remove(payload: CurrencyTypes.removeCurrenciesParams): Promise<CurrencyTypes.removeCurrenciesResult> {
  const { ids } = payload

  const currencies = await CurrencyModel.updateMany(
    { _id: { $in: ids } },
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
    batch: { ids: ids.map(id => id.toString()) },
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

export async function upload(payload: CurrencyTypes.importCurrenciesParams): Promise<CurrencyTypes.importCurrenciesResult> {
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
