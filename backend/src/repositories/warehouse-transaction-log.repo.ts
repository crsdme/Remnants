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
        from: 'inventories',
        localField: 'refId',
        foreignField: '_id',
        as: 'inventory',
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'refId',
        foreignField: '_id',
        as: 'product',
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
          $switch: {
            branches: [
              {
                case: { $in: ['$refType', ['warehouse', 'warehouse-transaction']] },
                then: { $arrayElemAt: ['$warehouseTransaction', 0] },
              },
              {
                case: { $eq: ['$refType', 'order'] },
                then: { $arrayElemAt: ['$order', 0] },
              },
              {
                case: { $eq: ['$refType', 'inventory'] },
                then: { $arrayElemAt: ['$inventory', 0] },
              },
              {
                case: { $eq: ['$refType', 'product'] },
                then: { $arrayElemAt: ['$product', 0] },
              },
            ],
            default: null,
          },
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
        previousCount: 1,
        afterCount: 1,
        refType: 1,
        refId: 1,
        resource: {
          id: { $ifNull: ['$resource._id', '$refId'] },
          seq: {
            $convert: {
              input: '$resource.seq',
              to: 'string',
              onError: '',
              onNull: '',
            },
          },
          name: { $ifNull: ['$resource.name', ''] },
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
