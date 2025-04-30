import { CurrencyModel } from '../models/'
import {
  extractLangMap,
  parseCSV,
  toBoolean,
  toNumber,
} from '../utils/parseTools'

interface getCurrenciesResult {
  currencies: any[]
  currenciesCount: number
}

interface getCurrenciesParams {
  filters: {
    names: string
    symbols: string
    language: string
    active: boolean[]
    priority: number
    createdAt: {
      from: Date
      to: Date
    }
  }
  sorters: {
    names: number
    priority: number
    updatedAt: number
    createdAt: number
  }
  pagination: {
    current: number
    pageSize: number
  }
}

export async function get(payload: getCurrenciesParams): Promise<getCurrenciesResult> {
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
  } = payload.filters

  const sorters = payload.sorters

  let query: Record<string, any> = { removed: false }

  if (names.trim()) {
    query = {
      ...query,
      [`names.${language}`]: { $regex: `^${names}`, $options: 'i' },
    }
  }

  if (symbols.trim()) {
    query = {
      ...query,
      [`symbols.${language}`]: { $regex: `^${symbols}`, $options: 'i' },
    }
  }

  if (Array.isArray(active) && active.length > 0) {
    query = {
      ...query,
      active: { $in: active },
    }
  }

  if (priority) {
    query = {
      ...query,
      priority,
    }
  }

  if (createdAt.from && createdAt.to) {
    query = {
      ...query,
      createdAt: { $gte: createdAt.from, $lte: createdAt.to },
    }
  }

  const pipeline = [
    {
      $match: query,
    },
    ...(sorters && Object.keys(sorters).length > 0
      ? [{ $sort: sorters as Record<string, 1 | -1> }]
      : []),
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

  const currenciesResult = await CurrencyModel.aggregate(pipeline).exec()

  const currencies = currenciesResult[0].currencies
  const currenciesCount = currenciesResult[0].totalCount[0]?.count || 0

  if (!currencies) {
    throw new Error('Currencies not found')
  }

  return { currencies, currenciesCount }
}

interface createCurrencyResult {
  currency: any
}

interface createCurrencyParams {
  names: object
  symbols: object
  priority: number
  active?: boolean
}

export async function create(payload: createCurrencyParams): Promise<createCurrencyResult> {
  const currency = await CurrencyModel.create(payload)

  if (!currency) {
    throw new Error('Currency not created')
  }

  return { currency }
}

interface editCurrenciesResult {
  currency: any
}

interface editCurrencyParams {
  _id: string
  name: string
  code: string
  main?: boolean
  active?: boolean
}

export async function edit(payload: editCurrencyParams): Promise<editCurrenciesResult> {
  const { _id } = payload

  if (!_id) {
    throw new Error('Need _ID')
  }

  const currency = await CurrencyModel.updateOne({ _id }, payload)

  if (!currency) {
    throw new Error('currency not edited')
  }

  return { currency }
}

interface removeCurrencyResult {
  currencies: number
}

interface removeCurrencyParams {
  _ids: string[]
}

export async function remove(payload: removeCurrencyParams): Promise<removeCurrencyResult> {
  const { _ids } = payload

  if (!_ids) {
    throw new Error('Need _IDS')
  }

  const currencies = await CurrencyModel.updateMany(
    { _id: { $in: _ids } },
    { $set: { removed: true } },
  )

  if (!currencies) {
    throw new Error('currency not removed')
  }

  return { currencies: currencies.modifiedCount }
}

interface batchCurrencyResult {
  currencies: number
}

interface batchCurrencyParams {
  _ids?: string[]
  filters?: {
    names?: string
    symbols?: string
    language: string
    active?: boolean[]
    priority?: number
    createdAt?: {
      from?: Date
      to?: Date
    }
  }
  params: {
    column: string
    value: string | number | boolean | Record<string, string>
  }[]
}

export async function batch(payload: batchCurrencyParams): Promise<batchCurrencyResult> {
  const { _ids, filters, params } = payload

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
  } = filters || {}

  if (!params) {
    throw new Error('Need params')
  }

  const allowedParams = ['names', 'symbols', 'priority', 'active']

  const filteredParams = params.filter(
    item => item.column && item.value && allowedParams.includes(item.column),
  )

  const batchParams = filteredParams.map(item => ({ [`${item.column}`]: item.value }))

  const mergedBatchParams = Object.assign({}, ...batchParams)

  let query: Record<string, any> = { removed: false }

  if (names.trim()) {
    query = {
      ...query,
      [`names.${language}`]: { $regex: `^${names}`, $options: 'i' },
    }
  }

  if (symbols.trim()) {
    query = {
      ...query,
      [`symbols.${language}`]: { $regex: `^${symbols}`, $options: 'i' },
    }
  }

  if (Array.isArray(active) && active.length > 0) {
    query = {
      ...query,
      active: { $in: active },
    }
  }

  if (priority) {
    query = {
      ...query,
      priority,
    }
  }

  if (createdAt.from && createdAt.to) {
    query = {
      ...query,
      createdAt: { $gte: createdAt.from, $lte: createdAt.to },
    }
  }

  if (filters) {
    query = {
      $or: [query, { _id: { $in: _ids } }],
    }
  }
  else {
    query = {
      _id: { $in: _ids },
    }
  }

  const currencies = await CurrencyModel.updateMany(
    query,
    { $set: mergedBatchParams },
  )

  if (!currencies) {
    throw new Error('currency not batch edited')
  }

  return { currencies: currencies.modifiedCount }
}

interface importCurrenciesResult {
  status: string
}

interface importCurrenciesParams {
  file: {
    fieldname: string
    originalname: string
    destination: string
    filename: string
    path: string
  }
}

export async function upload(payload: importCurrenciesParams): Promise<importCurrenciesResult> {
  const { file } = payload

  const storedFile = await parseCSV(file.path)

  const parsedCurrencies = storedFile.map(row => ({
    names: extractLangMap(row, 'name'),
    symbols: extractLangMap(row, 'symbol'),
    priority: toNumber(row.priority),
    active: toBoolean(row.active),
  }))

  await CurrencyModel.insertMany(parsedCurrencies)

  return { status: 'success' }
}

interface duplicateCurrencyResult {
  status: string
}

interface duplicateCurrencyParams {
  _ids: string[]
}

export async function duplicate(payload: duplicateCurrencyParams): Promise<duplicateCurrencyResult> {
  const { _ids } = payload

  const currencies = await CurrencyModel.find({ _id: { $in: _ids } })

  const parsedCurrencies = currencies.map(currency => ({
    names: currency.names,
    symbols: currency.symbols,
    priority: currency.priority,
    active: currency.active,
  }))

  const newCurrencies = await CurrencyModel.insertMany(parsedCurrencies)

  console.log(newCurrencies)

  return { status: 'success' }
}
