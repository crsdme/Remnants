import type { AggregateResult, StockMovePopulatedDTO } from '@remnant/shared'
import type { ClientSession, FilterQuery, PipelineStage } from 'mongoose'
import type { CreateStockMoveRepoPayload, GetStockMovesPayload, GetStockMovesRepoResult, StockMoveDB } from '@/types'
import { StockMoveModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function createOne({
  payload,
  session,
}: {
  payload: CreateStockMoveRepoPayload
  session?: ClientSession
}) {
  const [move] = await StockMoveModel.create([payload], { session })
  return move
}

export async function findById(id: string, session?: ClientSession) {
  return StockMoveModel.findById(id).session(session ?? null).exec()
}

export async function listPostedByDocument({
  documentType,
  documentId,
  documentItemId,
  session,
}: {
  documentType: StockMoveDB['documentType']
  documentId: string
  documentItemId?: string | null
  session?: ClientSession
}) {
  const query: FilterQuery<StockMoveDB> = {
    documentType,
    documentId,
    cancelled: false,
  }
  if (documentItemId !== undefined)
    query.documentItemId = documentItemId

  return StockMoveModel
    .find(query)
    .sort({ createdAt: -1, _id: -1 })
    .session(session ?? null)
    .exec()
}

export async function findOpenTransit({
  documentType,
  documentId,
  productId,
  session,
}: {
  documentType: StockMoveDB['documentType']
  documentId: string
  productId: string
  session?: ClientSession
}) {
  return StockMoveModel
    .findOne({
      documentType,
      documentId,
      productId,
      toKind: 'transit',
      cancelled: false,
      openQuantity: { $gt: 0 },
    })
    .sort({ createdAt: 1 })
    .session(session ?? null)
    .exec()
}

export async function findLastCustomerMove({
  productId,
  warehouseId,
  session,
}: {
  productId: string
  warehouseId: string
  session?: ClientSession
}) {
  return StockMoveModel
    .findOne({
      productId,
      fromWarehouseId: warehouseId,
      toKind: 'customer',
      cancelled: false,
    })
    .sort({ createdAt: -1 })
    .session(session ?? null)
    .exec()
}

export async function findLastWarehouseMove({
  productId,
  warehouseId,
  session,
}: {
  productId: string
  warehouseId: string
  session?: ClientSession
}) {
  return StockMoveModel
    .findOne({
      productId,
      cancelled: false,
      $or: [
        { fromWarehouseId: warehouseId },
        { toWarehouseId: warehouseId },
      ],
    })
    .sort({ createdAt: -1 })
    .session(session ?? null)
    .exec()
}

export async function markCancelled({
  id,
  cancelledBy,
  session,
}: {
  id: string
  cancelledBy?: string | null
  session?: ClientSession
}) {
  return StockMoveModel.findOneAndUpdate(
    { _id: id, cancelled: false },
    {
      $set: {
        cancelled: true,
        cancelledAt: new Date(),
        cancelledBy: cancelledBy ?? null,
        openQuantity: 0,
      },
    },
    { new: true, session },
  ).exec()
}

export async function changeOpenQuantity({
  id,
  delta,
  session,
}: {
  id: string
  delta: number
  session?: ClientSession
}) {
  return StockMoveModel.findOneAndUpdate(
    { _id: id },
    { $inc: { openQuantity: delta } },
    { new: true, session },
  ).exec()
}

export async function listLastCustomerSaleAtByWarehouse(warehouseId: string) {
  return StockMoveModel.aggregate<{ productId: string, lastSaleAt: Date }>([
    {
      $match: {
        fromWarehouseId: warehouseId,
        toKind: 'customer',
        cancelled: false,
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$productId',
        lastSaleAt: { $first: '$createdAt' },
      },
    },
    { $project: { _id: 0, productId: '$_id', lastSaleAt: 1 } },
  ]).exec()
}

export async function listLastMoveAtByWarehouse(warehouseId: string) {
  return StockMoveModel.aggregate<{ productId: string, lastMoveAt: Date }>([
    {
      $match: {
        cancelled: false,
        $or: [
          { fromWarehouseId: warehouseId },
          { toWarehouseId: warehouseId },
        ],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$productId',
        lastMoveAt: { $first: '$createdAt' },
      },
    },
    { $project: { _id: 0, productId: '$_id', lastMoveAt: 1 } },
  ]).exec()
}

export async function list(payload: GetStockMovesPayload): Promise<GetStockMovesRepoResult> {
  const { current, pageSize, full } = payload.pagination
  const {
    productId,
    warehouseId,
    documentType,
    documentId,
    userId,
    createdAt,
  } = payload.filters

  const query = buildQuery({
    filters: { productId, documentType, documentId, userId, createdAt },
    rules: {
      productId: { type: 'exact' },
      documentType: { type: 'exact' },
      documentId: { type: 'exact' },
      userId: { type: 'exact' },
      createdAt: { type: 'dateRange' },
    },
    removed: false,
  })

  if (warehouseId !== undefined) {
    query.$or = [
      { fromWarehouseId: warehouseId },
      { toWarehouseId: warehouseId },
    ]
  }

  const sorters = buildSortQuery(payload.sorters, { createdAt: -1, _id: -1 })

  const pipeline: PipelineStage[] = [
    { $match: query },
    { $sort: sorters },
    {
      $lookup: {
        from: 'warehouses',
        localField: 'fromWarehouseId',
        foreignField: '_id',
        as: 'fromWarehouse',
      },
    },
    {
      $lookup: {
        from: 'warehouses',
        localField: 'toWarehouseId',
        foreignField: '_id',
        as: 'toWarehouse',
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
      $lookup: {
        from: 'orders',
        localField: 'documentId',
        foreignField: '_id',
        as: 'order',
      },
    },
    {
      $lookup: {
        from: 'warehouse-transactions',
        localField: 'documentId',
        foreignField: '_id',
        as: 'warehouseTransaction',
      },
    },
    {
      $lookup: {
        from: 'procurements',
        localField: 'documentId',
        foreignField: '_id',
        as: 'procurement',
      },
    },
    {
      $addFields: {
        fromWarehouse: { $arrayElemAt: ['$fromWarehouse', 0] },
        toWarehouse: { $arrayElemAt: ['$toWarehouse', 0] },
        user: { $arrayElemAt: ['$user', 0] },
        documentSeq: {
          $switch: {
            branches: [
              {
                case: { $eq: ['$documentType', 'order'] },
                then: { $arrayElemAt: ['$order.seq', 0] },
              },
              {
                case: { $eq: ['$documentType', 'warehouse-transaction'] },
                then: { $arrayElemAt: ['$warehouseTransaction.seq', 0] },
              },
              {
                case: { $eq: ['$documentType', 'inventory'] },
                then: { $arrayElemAt: ['$inventory.seq', 0] },
              },
              {
                case: { $eq: ['$documentType', 'procurement'] },
                then: { $arrayElemAt: ['$procurement.seq', 0] },
              },
            ],
            default: null,
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        productId: 1,
        fromKind: 1,
        toKind: 1,
        fromWarehouseId: 1,
        toWarehouseId: 1,
        quantity: 1,
        openQuantity: 1,
        layers: 1,
        documentType: 1,
        documentId: 1,
        documentItemId: 1,
        documentSeq: 1,
        userId: 1,
        cancelled: 1,
        cancelledAt: 1,
        cancelledBy: 1,
        createdAt: 1,
        updatedAt: 1,
        fromWarehouse: {
          $cond: [
            { $ifNull: ['$fromWarehouse', false] },
            {
              id: '$fromWarehouse._id',
              names: '$fromWarehouse.names',
            },
            null,
          ],
        },
        toWarehouse: {
          $cond: [
            { $ifNull: ['$toWarehouse', false] },
            {
              id: '$toWarehouse._id',
              names: '$toWarehouse.names',
            },
            null,
          ],
        },
        user: {
          $cond: [
            { $ifNull: ['$user', false] },
            {
              id: '$user._id',
              name: '$user.name',
            },
            null,
          ],
        },
      },
    },
    {
      $facet: {
        items: full
          ? []
          : [{ $skip: (current - 1) * pageSize }, { $limit: pageSize }],
        count: [{ $count: 'count' }],
      },
    },
  ]

  const raw = await StockMoveModel.aggregate<AggregateResult<StockMovePopulatedDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function listOpenTransit() {
  return StockMoveModel.find({
    toKind: 'transit',
    cancelled: false,
    openQuantity: { $gt: 0 },
  }).lean().exec() as Promise<StockMoveDB[]>
}
