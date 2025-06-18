import type * as WarehouseTypes from '../types/warehouse.type'
import { WarehouseModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: WarehouseTypes.getWarehousesParams): Promise<WarehouseTypes.getWarehousesResult> {
  const { current = 1, pageSize = 10 } = payload.pagination

  const {
    names = '',
    active = undefined,
    priority = undefined,
    language = 'en',
  } = payload.filters

  const filterRules = {
    names: { type: 'string', langAware: true },
    active: { type: 'array' },
    priority: { type: 'exact' },
  } as const

  const query = buildQuery({
    filters: { names, active, priority },
    rules: filterRules,
    language,
  })

  const sorters = buildSortQuery(payload.sorters, { priority: 1 })

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $facet: {
        warehouses: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const warehousesRaw = await WarehouseModel.aggregate(pipeline).exec()

  const warehouses = warehousesRaw[0].warehouses.map((doc: any) => WarehouseModel.hydrate(doc))
  const warehousesCount = warehousesRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'WAREHOUSES_FETCHED', message: 'Warehouses fetched', warehouses, warehousesCount }
}

export async function create(payload: WarehouseTypes.createWarehousesParams): Promise<WarehouseTypes.createWarehousesResult> {
  const warehouse = await WarehouseModel.create(payload)

  return { status: 'success', code: 'WAREHOUSE_CREATED', message: 'Warehouse created', warehouse }
}

export async function edit(payload: WarehouseTypes.editWarehousesParams): Promise<WarehouseTypes.editWarehousesResult> {
  const { id } = payload

  const warehouse = await WarehouseModel.findOneAndUpdate({ _id: id }, payload)

  if (!warehouse) {
    throw new HttpError(400, 'Warehouse not edited', 'WAREHOUSE_NOT_EDITED')
  }

  return { status: 'success', code: 'WAREHOUSE_EDITED', message: 'Warehouse edited', warehouse }
}

export async function remove(payload: WarehouseTypes.removeWarehousesParams): Promise<WarehouseTypes.removeWarehousesResult> {
  const { ids } = payload

  const warehouses = await WarehouseModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!warehouses) {
    throw new HttpError(400, 'Warehouses not removed', 'WAREHOUSES_NOT_REMOVED')
  }

  return { status: 'success', code: 'WAREHOUSES_REMOVED', message: 'Warehouses removed' }
}
