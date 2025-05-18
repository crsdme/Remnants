import type * as UnitTypes from '../types/unit.type'
import { UnitModel } from '../models/'
import { HttpError } from '../utils/httpError'
import {
  extractLangMap,
  parseFile,
  toBoolean,
  toNumber,
} from '../utils/parseTools'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

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

  const sorters = buildSortQuery(payload.sorters)

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

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sorters,
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

  const unitsRaw = await UnitModel.aggregate(pipeline).exec()

  const units = unitsRaw[0].units.map((doc: any) => UnitModel.hydrate(doc))
  const unitsCount = unitsRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'UNITS_FETCHED', message: 'Units fetched', units, unitsCount }
}

export async function create(payload: UnitTypes.createUnitParams): Promise<UnitTypes.createUnitsResult> {
  const unit = await UnitModel.create(payload)

  return { status: 'success', code: 'UNIT_CREATED', message: 'Unit created', unit }
}

export async function edit(payload: UnitTypes.editUnitParams): Promise<UnitTypes.editUnitResult> {
  const { id } = payload

  const unit = await UnitModel.findOneAndUpdate({ _id: id }, payload)

  if (!unit) {
    throw new HttpError(400, 'Unit not edited', 'UNIT_NOT_EDITED')
  }

  return { status: 'success', code: 'UNIT_EDITED', message: 'Unit edited', unit }
}

export async function remove(payload: UnitTypes.removeUnitsParams): Promise<UnitTypes.removeUnitsResult> {
  const { ids } = payload

  const units = await UnitModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!units) {
    throw new HttpError(400, 'Units not removed', 'UNITS_NOT_REMOVED')
  }

  return { status: 'success', code: 'UNITS_REMOVED', message: 'Units removed' }
}

export async function batch(payload: UnitTypes.batchUnitsParams): Promise<UnitTypes.batchUnitsResult> {
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
    names: extractLangMap(row, 'names'),
    symbols: extractLangMap(row, 'symbols'),
    priority: toNumber(row.priority),
    active: toBoolean(row.active),
  }))

  const units = await UnitModel.create(parsedUnits)

  const unitIds = units.map(unit => unit._id)

  return { status: 'success', code: 'UNITS_IMPORTED', message: 'Units imported', unitIds }
}

export async function duplicate(payload: UnitTypes.duplicateUnitParams): Promise<UnitTypes.duplicateUnitResult> {
  const { ids } = payload

  const units = await UnitModel.find({ _id: { $in: ids } })

  const parsedUnits = units.map(unit => ({
    names: unit.names,
    symbols: unit.symbols,
    priority: unit.priority,
    active: unit.active,
  }))

  await UnitModel.create(parsedUnits)

  return { status: 'success', code: 'UNITS_DUPLICATED', message: 'Units duplicated' }
}
