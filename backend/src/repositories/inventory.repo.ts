import type { AggregateResult, InventoryDTO, InventoryItemDTO } from '@remnant/shared'
import type { ClientSession, PipelineStage } from 'mongoose'
import type {
  CreateInventoriesRepoPayload,
  CreateInventoryItemsRepoPayload,
  EditInventoryItemsRepoPayload,
  EditInventoryRepoPayload,
  GetInventoriesRepoPayload,
  GetInventoriesRepoResult,
  GetInventoryItemsRepoPayload,
  GetInventoryItemsRepoResult,
} from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { InventoryItemModel, InventoryModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list({ payload }: { payload: GetInventoriesRepoPayload }): Promise<GetInventoriesRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    seq,
    status,
    warehouseId,
    category,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: {
      seq,
      status,
      warehouseId,
      category,
      createdAt,
      updatedAt,
    },
    rules: {
      seq: { type: 'number' },
      status: { type: 'exact' },
      warehouseId: { type: 'exact' },
      category: { type: 'exact', field: 'categoryIds' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
    removed: false,
  })

  const sorters = buildSortQuery(payload.sorters, { seq: -1 })

  const pipeline: PipelineStage[] = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryIds',
        foreignField: '_id',
        as: 'categories',
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
      $addFields: {
        warehouse: {
          $first: '$warehouse',
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        seq: 1,
        status: 1,
        warehouse: {
          $cond: {
            if: { $gt: ['$warehouse', null] },
            then: {
              id: '$warehouse._id',
              names: '$warehouse.names',
            },
            else: '$$REMOVE',
          },
        },
        categories: {
          $map: {
            input: '$categories',
            as: 'category',
            in: {
              id: '$$category._id',
              names: '$$category.names',
            },
          },
        },
        comment: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $facet: {
        items: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        count: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await InventoryModel.aggregate<AggregateResult<InventoryDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function listItems({ payload }: { payload: GetInventoryItemsRepoPayload }): Promise<GetInventoryItemsRepoResult> {
  const {
    current,
    pageSize,
    full,
  } = payload.pagination

  const {
    inventoryId,
    view = 'all',
    search,
  } = payload.filters

  const query = buildQuery({
    filters: {
      inventoryId,
    },
    rules: {
      inventoryId: { type: 'string' },
    },
    removed: false,
  })

  const viewMatch: Record<string, unknown> = {}
  if (view === 'counted') {
    viewMatch.counted = true
  }
  else if (view === 'uncounted') {
    viewMatch.counted = false
  }
  else if (view === 'mismatch') {
    viewMatch.$expr = {
      $and: [
        { $eq: ['$counted', true] },
        { $ne: ['$receivedQuantity', '$quantity'] },
      ],
    }
  }

  const pipeline: PipelineStage[] = [
    { $match: query },
    ...(Object.keys(viewMatch).length > 0 ? [{ $match: viewMatch }] : []),
    {
      $lookup: {
        from: 'products',
        let: { productId: '$productId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$productId'] } } },
          {
            $lookup: {
              from: 'units',
              localField: 'unitId',
              foreignField: '_id',
              as: 'unit',
            },
          },
          {
            $lookup: {
              from: 'barcodes',
              localField: 'barcodeIds',
              foreignField: '_id',
              as: 'barcodes',
            },
          },
          {
            $project: {
              _id: 0,
              id: '$_id',
              seq: 1,
              names: 1,
              images: {
                $map: {
                  input: { $ifNull: ['$images', []] },
                  as: 'img',
                  in: {
                    id: { $ifNull: ['$$img.id', '$$img.filename'] },
                    filename: '$$img.filename',
                    name: '$$img.name',
                    type: '$$img.type',
                    path: '$$img.path',
                  },
                },
              },
              unit: {
                $cond: [
                  { $gt: [{ $size: '$unit' }, 0] },
                  {
                    id: { $arrayElemAt: ['$unit._id', 0] },
                    names: { $arrayElemAt: ['$unit.names', 0] },
                    symbols: { $arrayElemAt: ['$unit.symbols', 0] },
                  },
                  '$$REMOVE',
                ],
              },
              barcodes: {
                $map: {
                  input: '$barcodes',
                  as: 'barcode',
                  in: {
                    id: '$$barcode._id',
                    code: '$$barcode.code',
                  },
                },
              },
            },
          },
        ],
        as: 'product',
      },
    },
    {
      $addFields: {
        product: { $first: '$product' },
      },
    },
    {
      $lookup: {
        from: 'inventories',
        localField: 'inventoryId',
        foreignField: '_id',
        as: '_inventory',
      },
    },
    {
      $lookup: {
        from: 'quantities',
        let: {
          productId: '$productId',
          warehouseId: { $arrayElemAt: ['$_inventory.warehouseId', 0] },
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$productId', '$$productId'] },
                  { $eq: ['$warehouseId', '$$warehouseId'] },
                ],
              },
            },
          },
          {
            $lookup: {
              from: 'product-stock-statuses',
              localField: 'stockStatusId',
              foreignField: '_id',
              as: '_stockStatus',
            },
          },
          {
            $project: {
              _id: 0,
              stockStatus: {
                $cond: [
                  { $gt: [{ $size: '$_stockStatus' }, 0] },
                  {
                    $let: {
                      vars: { s: { $arrayElemAt: ['$_stockStatus', 0] } },
                      in: {
                        id: '$$s._id',
                        names: '$$s.names',
                        color: '$$s.color',
                      },
                    },
                  },
                  null,
                ],
              },
            },
          },
        ],
        as: '_quantity',
      },
    },
    {
      $addFields: {
        product: {
          $cond: [
            { $ifNull: ['$product', false] },
            {
              $mergeObjects: [
                '$product',
                {
                  stockStatus: {
                    $ifNull: [{ $arrayElemAt: ['$_quantity.stockStatus', 0] }, null],
                  },
                },
              ],
            },
            '$$REMOVE',
          ],
        },
      },
    },
  ]

  if (search != null && search !== '') {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const searchRegex = { $regex: escaped, $options: 'i' }
    const seqNumber = Number(search)
    pipeline.push({
      $match: {
        $or: [
          { 'product.names.ru': searchRegex },
          { 'product.names.en': searchRegex },
          { 'product.barcodes.code': searchRegex },
          ...(Number.isFinite(seqNumber) ? [{ 'product.seq': seqNumber }] : []),
        ],
      },
    })
  }

  pipeline.push(
    {
      $project: {
        _id: 0,
        id: { $toString: '$_id' },
        productId: 1,
        product: 1,
        quantity: 1,
        receivedQuantity: { $ifNull: ['$receivedQuantity', null] },
        counted: { $ifNull: ['$counted', false] },
        inventoryId: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $facet: {
        items: full
          ? [{ $skip: 0 }]
          : [
              { $skip: (current - 1) * pageSize },
              { $limit: pageSize },
            ],
        count: [
          { $count: 'count' },
        ],
      },
    },
  )

  const raw = await InventoryItemModel.aggregate<AggregateResult<InventoryItemDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function getProgress(inventoryId: string) {
  const [result] = await InventoryItemModel.aggregate<{
    total: number
    counted: number
    mismatches: number
  }>([
    { $match: { inventoryId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        counted: {
          $sum: { $cond: [{ $eq: ['$counted', true] }, 1, 0] },
        },
        mismatches: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$counted', true] },
                  { $ne: ['$receivedQuantity', '$quantity'] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]).exec()

  const total = result?.total ?? 0
  const counted = result?.counted ?? 0
  const mismatches = result?.mismatches ?? 0

  return {
    total,
    counted,
    uncounted: Math.max(total - counted, 0),
    mismatches,
  }
}

export async function create({ payload, session }: { payload: CreateInventoriesRepoPayload, session?: ClientSession }) {
  return InventoryModel.create([payload], { session })
}

export async function createItems({ payload, session }: { payload: CreateInventoryItemsRepoPayload[], session?: ClientSession }) {
  return InventoryItemModel.create(payload, { session })
}

export async function updateById({ id, payload, session }: { id: string, payload: EditInventoryRepoPayload, session?: ClientSession }) {
  return InventoryModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true, session },
  ).exec()
}

export async function updateOneItem({ payload, session }: { payload: EditInventoryItemsRepoPayload, session?: ClientSession }) {
  return InventoryItemModel.findOneAndUpdate(
    { _id: payload.id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true, session },
  ).exec()
}

export async function findById(id: string) {
  return InventoryModel.findById(id).exec()
}

export async function findItemsByInventoryId(inventoryId: string) {
  return InventoryItemModel.find({ inventoryId }).exec()
}

export async function findItemByInventoryAndProduct(inventoryId: string, productId: string) {
  return InventoryItemModel.findOne({ inventoryId, productId }).exec()
}

export async function upsertItemByProduct({
  inventoryId,
  productId,
  payload,
  session,
}: {
  inventoryId: string
  productId: string
  payload: {
    quantity?: number
    receivedQuantity: number | null
    counted: boolean
  }
  session?: ClientSession
}) {
  return InventoryItemModel.findOneAndUpdate(
    { inventoryId, productId },
    {
      $set: {
        receivedQuantity: payload.receivedQuantity,
        counted: payload.counted,
      },
      $setOnInsert: {
        _id: uuidv4(),
        inventoryId,
        productId,
        quantity: payload.quantity ?? 0,
      },
    },
    { new: true, upsert: true, runValidators: true, session },
  ).exec()
}

export async function cancelById(id: string, cancelledBy: string) {
  return InventoryModel.findOneAndUpdate(
    { _id: id, status: { $ne: 'cancelled' } },
    { $set: { status: 'cancelled', removedBy: cancelledBy, removedAt: new Date() } },
    { new: true, runValidators: true },
  ).exec()
}

export async function removeById(id: string, removedBy: string) {
  return InventoryModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true, removedBy, removedAt: new Date() } },
    { new: true, runValidators: true },
  ).exec()
}
