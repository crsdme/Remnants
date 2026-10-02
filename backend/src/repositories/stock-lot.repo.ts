import type { AggregateResult, StockLotDTO } from '@remnant/shared'
import type { ClientSession, PipelineStage } from 'mongoose'
import type { CreateStockLotRepoPayload, GetStockLotsPayload, GetStockLotsRepoResult } from '@/types'
import { StockLotModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function listOpenFifo({
  productId,
  warehouseId,
  session,
}: {
  productId: string
  warehouseId: string
  session?: ClientSession
}) {
  return StockLotModel
    .find({ productId, warehouseId, remainingCount: { $gt: 0 } })
    .sort({ receivedAt: 1, _id: 1 })
    .session(session ?? null)
    .exec()
}

export async function listDeficitFifo({
  productId,
  warehouseId,
  session,
}: {
  productId: string
  warehouseId: string
  session?: ClientSession
}) {
  return StockLotModel
    .find({ productId, warehouseId, remainingCount: { $lt: 0 } })
    .sort({ receivedAt: 1, _id: 1 })
    .session(session ?? null)
    .exec()
}

export async function findLatestByReceivedAt({
  productId,
  warehouseId,
  session,
}: {
  productId: string
  warehouseId: string
  session?: ClientSession
}) {
  return StockLotModel
    .findOne({ productId, warehouseId })
    .sort({ receivedAt: -1, _id: -1 })
    .session(session ?? null)
    .exec()
}

export async function countByProductWarehouse({
  productId,
  warehouseId,
  session,
}: {
  productId: string
  warehouseId: string
  session?: ClientSession
}): Promise<number> {
  return StockLotModel.countDocuments({ productId, warehouseId }).session(session ?? null).exec()
}

export async function sumRemaining({
  productId,
  warehouseId,
  session,
}: {
  productId: string
  warehouseId: string
  session?: ClientSession
}): Promise<number> {
  const [row] = await StockLotModel.aggregate<{ total: number }>([
    { $match: { productId, warehouseId } },
    { $group: { _id: null, total: { $sum: '$remainingCount' } } },
  ]).session(session ?? null).exec()

  return row?.total ?? 0
}

export async function sumRemainingByWarehouses(
  productId: string,
  warehouseIds: string[],
  session?: ClientSession,
): Promise<number> {
  if (warehouseIds.length === 0)
    return 0

  const [row] = await StockLotModel.aggregate<{ total: number }>([
    { $match: { productId, warehouseId: { $in: warehouseIds } } },
    { $group: { _id: null, total: { $sum: '$remainingCount' } } },
  ]).session(session ?? null).exec()

  return row?.total ?? 0
}

export async function listRemainingByWarehouse(warehouseId: string) {
  return StockLotModel.aggregate<{ productId: string, count: number }>([
    { $match: { warehouseId } },
    { $group: { _id: '$productId', count: { $sum: '$remainingCount' } } },
    { $project: { _id: 0, productId: '$_id', count: 1 } },
  ]).exec()
}

export async function listProductWarehousePairs(session?: ClientSession) {
  return StockLotModel.aggregate<{ productId: string, warehouseId: string }>([
    {
      $group: {
        _id: { productId: '$productId', warehouseId: '$warehouseId' },
      },
    },
    {
      $project: {
        _id: 0,
        productId: '$_id.productId',
        warehouseId: '$_id.warehouseId',
      },
    },
  ]).session(session ?? null).exec()
}

export function warehouseStockFromLotsLookup() {
  return {
    $lookup: {
      from: 'stock-lots',
      localField: '_id',
      foreignField: 'productId',
      pipeline: [
        {
          $group: {
            _id: '$warehouseId',
            count: { $sum: '$remainingCount' },
          },
        },
        {
          $project: {
            _id: 0,
            warehouseId: '$_id',
            count: 1,
          },
        },
      ],
      as: 'warehouseStock',
    },
  }
}

export function warehouseStockFromLotsAddFields() {
  return {
    $addFields: {
      warehouseStock: { $ifNull: ['$warehouseStock', []] },
    },
  }
}

export async function createOne({
  payload,
  session,
}: {
  payload: CreateStockLotRepoPayload
  session?: ClientSession
}) {
  const [lot] = await StockLotModel.create([payload], { session })
  return lot
}

export async function decrementRemaining({
  id,
  quantity,
  session,
}: {
  id: string
  quantity: number
  session?: ClientSession
}) {
  return StockLotModel.findOneAndUpdate(
    { _id: id, remainingCount: { $gte: quantity } },
    { $inc: { remainingCount: -quantity } },
    { new: true, session },
  ).exec()
}

export async function changeRemaining({
  id,
  delta,
  session,
}: {
  id: string
  delta: number
  session?: ClientSession
}) {
  return StockLotModel.findOneAndUpdate(
    { _id: id },
    { $inc: { remainingCount: delta } },
    { new: true, session },
  ).exec()
}

export async function incrementRemaining({
  id,
  quantity,
  session,
}: {
  id: string
  quantity: number
  session?: ClientSession
}) {
  return changeRemaining({ id, delta: quantity, session })
}

export async function listBySourceMoveId({
  sourceMoveId,
  session,
}: {
  sourceMoveId: string
  session?: ClientSession
}) {
  return StockLotModel.find({ sourceMoveId }).session(session ?? null).exec()
}

export async function list(payload: GetStockLotsPayload): Promise<GetStockLotsRepoResult> {
  const { current, pageSize, full } = payload.pagination
  const { productId, warehouseId, open } = payload.filters

  const query = buildQuery({
    filters: { productId, warehouseId },
    rules: {
      productId: { type: 'exact' },
      warehouseId: { type: 'exact' },
    },
    removed: false,
  })

  if (open === true)
    query.remainingCount = { $gt: 0 }

  const sorters = buildSortQuery(payload.sorters, { receivedAt: -1, _id: -1 })

  const pipeline: PipelineStage[] = [
    { $match: query },
    { $sort: sorters },
    {
      $project: {
        _id: 0,
        id: '$_id',
        productId: 1,
        warehouseId: 1,
        originalCount: 1,
        remainingCount: 1,
        minorUnitCost: 1,
        currencyId: 1,
        receivedAt: 1,
        sourceMoveId: 1,
        createdAt: 1,
        updatedAt: 1,
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

  const raw = await StockLotModel.aggregate<AggregateResult<StockLotDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize: full ? Math.max(total, pageSize) : pageSize }
}

export async function removeBySourceMoveId({
  sourceMoveId,
  session,
}: {
  sourceMoveId: string
  session?: ClientSession
}) {
  return StockLotModel.deleteMany({ sourceMoveId }).session(session ?? null).exec()
}

export async function sumValueByWarehouseCurrency() {
  return StockLotModel.aggregate<{
    warehouseId: string
    currencyId: string
    minorAmount: number
  }>([
    { $match: { remainingCount: { $ne: 0 } } },
    {
      $group: {
        _id: {
          warehouseId: '$warehouseId',
          currencyId: '$currencyId',
        },
        minorAmount: {
          $sum: {
            $multiply: [
              { $ifNull: ['$remainingCount', 0] },
              { $ifNull: ['$minorUnitCost', 0] },
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        warehouseId: '$_id.warehouseId',
        currencyId: '$_id.currencyId',
        minorAmount: 1,
      },
    },
  ]).exec()
}
