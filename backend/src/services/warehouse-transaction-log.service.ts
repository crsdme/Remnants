import type { RequestUser } from '../types/common.type'
import type * as WarehouseTransactionLogTypes from '../types/warehouse-transaction-log.type'
import { WarehouseTransactionLogModel } from '../models'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: WarehouseTransactionLogTypes.getWarehouseTransactionLogsParams): Promise<WarehouseTransactionLogTypes.getWarehouseTransactionLogsResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    productId,
    warehouseId,
    refType,
    refId,
    userId,
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
    productId: { type: 'string' },
    warehouseId: { type: 'string' },
    refType: { type: 'string' },
    refId: { type: 'string' },
    userId: { type: 'string' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { productId, warehouseId, refType, refId, userId, createdAt, updatedAt },
    rules: filterRules,
    removed: false,
  })

  const sorters = buildSortQuery(payload.sorters || {}, { createdAt: -1 })

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $lookup: {
        from: 'warehouse-transactions',
        localField: 'refId',
        foreignField: '_id',
        as: 'warehouseTransaction',
      },
    },
    {
      $lookup: {
        from: 'orders',
        localField: 'refId',
        foreignField: '_id',
        as: 'order',
      },
    },
    {
      $lookup: {
        from: 'warehouses',
        localField: 'warehouseId',
        foreignField: '_id',
        as: 'warehouse',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $addFields: {
        resource: {
          $cond: [
            { $eq: ['$resourceType', 'warehouseTransaction'] },
            { $first: '$warehouseTransaction' },
            { $first: '$order' },
          ],
        },
        warehouse: {
          $first: '$warehouse',
        },
        user: {
          $first: '$user',
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        deltaCount: 1,
        refType: 1,
        refId: 1,
        resource: 1,
        warehouse: 1,
        user: {
          id: '$user._id',
          name: '$user.name',
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $facet: {
        warehouseTransactionLogs: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const warehouseTransactionLogsRaw = await WarehouseTransactionLogModel.aggregate(pipeline).exec()

  const warehouseTransactionLogs = warehouseTransactionLogsRaw[0].warehouseTransactionLogs || []
  const warehouseTransactionLogsCount = warehouseTransactionLogsRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'WAREHOUSE_TRANSACTION_LOGS_FETCHED', message: 'Warehouse transaction logs fetched', warehouseTransactionLogs, warehouseTransactionLogsCount }
}

export async function create(payload: WarehouseTransactionLogTypes.createWarehouseTransactionLogsParams) {
  const { productId, warehouseId, deltaCount, refType, refId, userId } = payload

  const warehouseTransactionLog = await WarehouseTransactionLogModel.create({
    productId,
    warehouseId,
    deltaCount,
    refType,
    refId,
    userId,
    createdBy: userId,
  })

  return { status: 'success', code: 'WAREHOUSE_TRANSACTION_LOG_CREATED', message: 'Warehouse transaction log created', warehouseTransactionLog }
}
