import type * as UnitTypes from '../types/unit.type'
import { UnitModel } from '../models/'
import { HttpError } from '../utils/httpError'
import {
  extractLangMap,
  parseFile,
  toBoolean,
  toNumber,
} from '../utils/parseTools'

export async function get(payload: UnitTypes.getUnitsParams): Promise<UnitTypes.getUnitsResult> {
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

  const sorters = payload.sorters

  let query: Record<string, any> = { removed: false }

  let sortersQuery: Record<string, any> = { _id: 1 }

  if (Object.entries(sorters).length > 0) {
    sortersQuery = Object.fromEntries(
      Object.entries(sorters).map(([key, value]) => [
        key,
        value === 'asc' ? 1 : -1,
      ]),
    )
  }

  if (names) {
    query = {
      ...query,
      [`names.${language}`]: { $regex: `^${names}`, $options: 'i' },
    }
  }

  if (symbols) {
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

  if (updatedAt.from && updatedAt.to) {
    query = {
      ...query,
      updatedAt: { $gte: updatedAt.from, $lte: updatedAt.to },
    }
  }

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sortersQuery,
    },
    {
      $facet: {
        units: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const unitsResult = await UnitModel.aggregate(pipeline).exec()

  const units = unitsResult[0].units
  const unitsCount = unitsResult[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'UNITS_FETCHED', message: 'Units fetched', units, unitsCount }
}

export async function create(payload: UnitTypes.createUnitParams): Promise<UnitTypes.createUnitsResult> {
  const unit = await UnitModel.create(payload)

  return { status: 'success', code: 'UNIT_CREATED', message: 'Unit created', unit }
}

export async function edit(payload: UnitTypes.editUnitParams): Promise<UnitTypes.editUnitResult> {
  const { _id } = payload

  const unit = await UnitModel.findOneAndUpdate({ _id }, payload)

  if (!unit) {
    throw new HttpError(400, 'Unit not edited', 'UNIT_NOT_EDITED')
  }

  return { status: 'success', code: 'UNIT_EDITED', message: 'Unit edited', unit }
}

export async function remove(payload: UnitTypes.removeUnitParams): Promise<UnitTypes.removeUnitsResult> {
  const { _ids } = payload

  const units = await UnitModel.updateMany(
    { _id: { $in: _ids } },
    { $set: { removed: true } },
  )

  if (!units) {
    throw new HttpError(400, 'Units not removed', 'UNITS_NOT_REMOVED')
  }

  return { status: 'success', code: 'UNITS_REMOVED', message: 'Units removed' }
}

export async function batch(payload: UnitTypes.batchUnitsParams): Promise<UnitTypes.batchUnitsResult> {
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
    updatedAt = {
      from: undefined,
      to: undefined,
    },
  } = filters || {}

  const allowedParams = ['names', 'symbols', 'priority', 'active']

  const filteredParams = params.filter(
    item => item.column && item.value && allowedParams.includes(item.column),
  )

  const batchParams = filteredParams.map(item => ({ [`${item.column}`]: item.value }))

  const mergedBatchParams = Object.assign({}, ...batchParams)

  let query: Record<string, any> = { removed: false }

  if (names) {
    query = {
      ...query,
      [`names.${language}`]: { $regex: `^${names}`, $options: 'i' },
    }
  }

  if (symbols) {
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

  if (updatedAt.from && updatedAt.to) {
    query = {
      ...query,
      updatedAt: { $gte: updatedAt.from, $lte: updatedAt.to },
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

  const units = await UnitModel.updateMany(
    query,
    { $set: mergedBatchParams },
  )

  if (!units) {
    throw new HttpError(400, 'Units not batch edited', 'UNITS_NOT_BATCH_EDITED')
  }

  return { status: 'success', code: 'UNITS_BATCH_EDITED', message: 'Units batch edited' }
}

export async function upload(payload: UnitTypes.importUnitsParams): Promise<UnitTypes.importUnitsResult> {
  const { file } = payload

  const storedFile = await parseFile(file.path)

  const parsedUnits = storedFile.map(row => ({
    names: extractLangMap(row, 'name'),
    symbols: extractLangMap(row, 'symbol'),
    priority: toNumber(row.priority),
    active: toBoolean(row.active),
  }))

  await UnitModel.insertMany(parsedUnits)

  return { status: 'success', code: 'UNITS_IMPORTED', message: 'Units imported' }
}

export async function duplicate(payload: UnitTypes.duplicateUnitParams): Promise<UnitTypes.duplicateUnitResult> {
  const { _ids } = payload

  const units = await UnitModel.find({ _id: { $in: _ids } })

  const parsedUnits = units.map(unit => ({
    names: unit.names,
    symbols: unit.symbols,
    priority: unit.priority,
    active: unit.active,
  }))

  await UnitModel.insertMany(parsedUnits)

  return { status: 'success', code: 'UNITS_DUPLICATED', message: 'Units duplicated' }
}
