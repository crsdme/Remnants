import type {
  AggregateResult,
  WarehouseTransactionLogPopulatedDTO,
} from '@remnant/shared'
import type { ClientSession, PipelineStage } from 'mongoose'
import type {
  CreateWarehouseTransactionLogsPayload,
  GetWarehouseTransactionLogsPayload,
  GetWarehouseTransactionLogsRepoResult,
} from '@/types/'
import { WarehouseTransactionLogModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetWarehouseTransactionLogsPayload): Promise<GetWarehouseTransactionLogsRepoResult> {
  const {
    current,
    pageSize,
    full,
  } = payload.pagination

  const {
    productId,
    warehouseId,
    refType,
    refId,
    userId,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { productId, warehouseId, refType, refId, userId, createdAt, updatedAt },
    rules: {
      productId: { type: 'exact' },
      warehouseId: { type: 'exact' },
      refType: { type: 'exact' },
      refId: { type: 'exact' },
      userId: { type: 'exact' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
    removed: false,
  })

  const sorters = buildSortQuery(payload.sorters, { createdAt: -1 })

  const pipeline: PipelineStage[] = [
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
        as: 'warehouse-transaction',
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
            { $eq: ['$resourceType', 'warehouse-transaction'] },
            { $first: '$warehouse-transaction' },
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
        resource: {
          id: '$resource._id',
          seq: '$resource.seq',
          name: '$resource.name',
        },
        warehouse: {
          id: '$warehouse._id',
          names: '$warehouse.names',
        },
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
        items: full
          ? []
          : [{ $skip: (current - 1) * pageSize }, { $limit: pageSize }],
        count: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await WarehouseTransactionLogModel.aggregate<AggregateResult<WarehouseTransactionLogPopulatedDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne({ payload, session }: { payload: CreateWarehouseTransactionLogsPayload, session?: ClientSession }) {
  return WarehouseTransactionLogModel.create([payload], { session })
}
