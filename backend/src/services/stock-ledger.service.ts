import type { GetStockLotsResponse, GetStockMovesResponse, StockLocationKind, StockMoveDTO, StockMoveLayerDTO } from '@remnant/shared'
import type { ClientSession } from 'mongoose'
import type { GetStockLotsPayload, GetStockMovesPayload, StockMoveDB } from '@/types'
import { toMinorType } from '@remnant/shared'
import { v4 as uuidv4 } from 'uuid'
import { mapStockLotToDTO, mapStockMoveToDTO } from '@/mappers/stock-ledger.mapper'
import * as ProductsRepository from '@/repositories/products.repo'
import * as QuantityRepository from '@/repositories/quantity.repo'
import * as StockLotRepo from '@/repositories/stock-lot.repo'
import * as StockMoveRepo from '@/repositories/stock-move.repo'
import * as SyncEntryService from '@/services/sync-entry.service'
import { HttpError } from '@/utils/'
import { allocateFifo, takeFromLayers, weightedMinorUnitCost } from './fifo.utils'

export async function receiveFromSupplier({
  payload,
  session,
}: {
  payload: Omit<PostStockMovePayload, 'fromKind' | 'toKind'> & { toWarehouseId: string }
  session?: ClientSession
}): Promise<PostStockMoveResult> {
  return post({
    payload: {
      ...payload,
      fromKind: 'supplier',
      toKind: 'warehouse',
    },
    session,
  })
}

export async function listMoves({ payload }: { payload: GetStockMovesPayload }): Promise<GetStockMovesResponse> {
  const { items, total, page, pageSize } = await StockMoveRepo.list(payload)

  return {
    status: 'success',
    code: 'STOCK_MOVES_FETCHED',
    message: 'Stock moves fetched',
    data: {
      items,
      pagination: {
        total,
        page,
        pageSize,
      },
    },
  }
}

export async function listLots({ payload }: { payload: GetStockLotsPayload }): Promise<GetStockLotsResponse> {
  const { items, total, page, pageSize } = await StockLotRepo.list(payload)

  return {
    status: 'success',
    code: 'STOCK_LOTS_FETCHED',
    message: 'Stock lots fetched',
    data: {
      items: items.map(item => mapStockLotToDTO({
        _id: item.id,
        productId: item.productId,
        warehouseId: item.warehouseId,
        originalCount: item.originalCount,
        remainingCount: item.remainingCount,
        minorUnitCost: item.minorUnitCost,
        currencyId: item.currencyId,
        receivedAt: item.receivedAt,
        sourceMoveId: item.sourceMoveId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      pagination: {
        total,
        page,
        pageSize,
      },
    },
  }
}

interface Layer {
  lotId: string
  quantity: number
  minorUnitCost: number
  currencyId: string
  receivedAt: Date
}

export interface PostStockMovePayload {
  fromKind: StockLocationKind
  toKind: StockLocationKind
  fromWarehouseId?: string | null
  toWarehouseId?: string | null
  productId: string
  quantity: number
  documentType: StockMoveDB['documentType']
  documentId: string
  documentItemId?: string | null
  userId?: string
  inboundCost?: {
    minorUnitCost: number
    currencyId: string
    receivedAt?: Date
  }
  skipQuantitySync?: boolean
}

export interface PostStockMoveResult {
  move: StockMoveDTO
  layers: StockMoveLayerDTO[]
  weightedMinorUnitCost: number | null
}

export async function onHand({
  productId,
  warehouseId,
  session,
}: {
  productId: string
  warehouseId: string
  session?: ClientSession
}): Promise<number> {
  const lotCount = await StockLotRepo.countByProductWarehouse({ productId, warehouseId, session })
  const lotsSum = await StockLotRepo.sumRemaining({ productId, warehouseId, session })
  if (lotCount > 0)
    return lotsSum

  const quantity = await QuantityRepository.findByProductWarehouse({ productId, warehouseId, session })
  return quantity?.count ?? 0
}

export async function post({
  payload,
  session,
}: {
  payload: PostStockMovePayload
  session?: ClientSession
}): Promise<PostStockMoveResult> {
  const quantity = Math.trunc(payload.quantity)
  if (quantity <= 0)
    throw new HttpError(400, 'Stock quantity must be positive', 'STOCK_QUANTITY_INVALID')

  assertLocation(payload.fromKind, payload.fromWarehouseId, 'from')
  assertLocation(payload.toKind, payload.toWarehouseId, 'to')

  if (isWarehouse(payload.fromKind, payload.fromWarehouseId))
    await ensureLotsFromQuantity({ productId: payload.productId, warehouseId: payload.fromWarehouseId, userId: payload.userId, session })

  const moveId = uuidv4()
  let layers: Layer[] = []

  if (isWarehouse(payload.fromKind, payload.fromWarehouseId)) {
    layers = await consumeWarehouseLots({
      productId: payload.productId,
      warehouseId: payload.fromWarehouseId,
      quantity,
      moveId,
      session,
    })
  }
  else if (payload.fromKind === 'transit') {
    layers = await consumeTransitLayers({
      productId: payload.productId,
      quantity,
      documentType: payload.documentType,
      documentId: payload.documentId,
      session,
    })
  }
  else if (payload.fromKind === 'supplier' || payload.fromKind === 'adjustment') {
    layers = []
  }
  else {
    throw new HttpError(400, 'Unsupported stock origin', 'STOCK_ORIGIN_UNSUPPORTED')
  }

  if (isWarehouse(payload.toKind, payload.toWarehouseId)) {
    if (layers.length === 0) {
      layers = await placeInboundLots({
        productId: payload.productId,
        warehouseId: payload.toWarehouseId,
        quantity,
        moveId,
        inboundCost: payload.inboundCost,
        session,
      })
    }
    else {
      for (const layer of layers) {
        await StockLotRepo.createOne({
          payload: {
            _id: uuidv4(),
            productId: payload.productId,
            warehouseId: payload.toWarehouseId,
            originalCount: layer.quantity,
            remainingCount: layer.quantity,
            minorUnitCost: toMinorType(Number(layer.minorUnitCost)),
            currencyId: layer.currencyId,
            receivedAt: layer.receivedAt,
            sourceMoveId: moveId,
          },
          session,
        })
      }
    }
  }

  const openQuantity = payload.toKind === 'transit' ? quantity : 0

  const move = await StockMoveRepo.createOne({
    payload: {
      _id: moveId,
      productId: payload.productId,
      fromKind: payload.fromKind,
      toKind: payload.toKind,
      fromWarehouseId: payload.fromWarehouseId ?? null,
      toWarehouseId: payload.toWarehouseId ?? null,
      quantity,
      openQuantity,
      layers: layers.map(layer => ({
        lotId: layer.lotId,
        quantity: layer.quantity,
        minorUnitCost: toMinorType(layer.minorUnitCost),
        currencyId: layer.currencyId,
        receivedAt: layer.receivedAt,
      })),
      documentType: payload.documentType,
      documentId: payload.documentId,
      documentItemId: payload.documentItemId ?? null,
      userId: payload.userId ?? null,
      cancelled: false,
      cancelledAt: null,
      cancelledBy: null,
    },
    session,
  })

  if (!payload.skipQuantitySync && payload.documentType !== 'migration') {
    await syncQuantityCache({
      fromKind: payload.fromKind,
      fromWarehouseId: payload.fromWarehouseId,
      toKind: payload.toKind,
      toWarehouseId: payload.toWarehouseId,
      productId: payload.productId,
      quantity,
      userId: payload.userId,
      documentType: payload.documentType,
      documentId: payload.documentId,
      session,
      reverse: false,
    })
  }

  const mappedLayers = layers.map(layer => ({
    lotId: layer.lotId,
    quantity: layer.quantity,
    minorUnitCost: toMinorType(Number(layer.minorUnitCost)),
    currencyId: layer.currencyId,
    receivedAt: layer.receivedAt,
  }))

  return {
    move: mapStockMoveToDTO(move),
    layers: mappedLayers,
    weightedMinorUnitCost: weightedMinorUnitCost(mappedLayers),
  }
}

export async function cancel({
  documentType,
  documentId,
  documentItemId,
  userId,
  session,
  skipQuantitySync,
}: {
  documentType: StockMoveDB['documentType']
  documentId: string
  documentItemId?: string | null
  userId?: string
  session?: ClientSession
  skipQuantitySync?: boolean
}): Promise<void> {
  const moves = await StockMoveRepo.listPostedByDocument({
    documentType,
    documentId,
    documentItemId,
    session,
  })

  for (const move of moves)
    await cancelMove({ move, userId, session, skipQuantitySync })
}

async function cancelMove({
  move,
  userId,
  session,
  skipQuantitySync,
}: {
  move: StockMoveDB
  userId?: string
  session?: ClientSession
  skipQuantitySync?: boolean
}) {
  if (move.toKind === 'warehouse') {
    const createdLots = await StockLotRepo.listBySourceMoveId({ sourceMoveId: move._id, session })
    const remaining = createdLots.reduce((sum, lot) => sum + lot.remainingCount, 0)
    const original = createdLots.reduce((sum, lot) => sum + lot.originalCount, 0)
    if (remaining < original)
      throw new HttpError(400, 'Stock move already consumed', 'STOCK_MOVE_ALREADY_CONSUMED')

    const createdIds = new Set(createdLots.map(lot => String(lot._id)))
    await StockLotRepo.removeBySourceMoveId({ sourceMoveId: move._id, session })

    for (const layer of move.layers) {
      if (createdIds.has(String(layer.lotId)))
        continue

      await StockLotRepo.changeRemaining({
        id: String(layer.lotId),
        delta: -Number(layer.quantity),
        session,
      })
    }
  }

  if (move.fromKind === 'warehouse') {
    for (const layer of move.layers) {
      await StockLotRepo.incrementRemaining({
        id: String(layer.lotId),
        quantity: Number(layer.quantity),
        session,
      })
    }
  }

  if (move.fromKind === 'transit') {
    const transitMove = await StockMoveRepo.findOpenTransit({
      documentType: move.documentType,
      documentId: move.documentId,
      productId: move.productId,
      session,
    })
    const source = transitMove ?? (await StockMoveRepo.listPostedByDocument({
      documentType: move.documentType,
      documentId: move.documentId,
      session,
    })).find(item => item.toKind === 'transit' && item.productId === move.productId && item._id !== move._id)

    if (source) {
      await StockMoveRepo.changeOpenQuantity({
        id: source._id,
        delta: move.quantity,
        session,
      })
    }
  }

  await StockMoveRepo.markCancelled({
    id: move._id,
    cancelledBy: userId ?? null,
    session,
  })

  if (!skipQuantitySync && move.documentType !== 'migration') {
    await syncQuantityCache({
      fromKind: move.fromKind,
      fromWarehouseId: move.fromWarehouseId,
      toKind: move.toKind,
      toWarehouseId: move.toWarehouseId,
      productId: move.productId,
      quantity: move.quantity,
      userId,
      documentType: move.documentType,
      documentId: move.documentId,
      session,
      reverse: true,
    })
  }
}

async function consumeWarehouseLots({
  productId,
  warehouseId,
  quantity,
  moveId,
  session,
}: {
  productId: string
  warehouseId: string
  quantity: number
  moveId: string
  session?: ClientSession
}): Promise<Layer[]> {
  const lots = await StockLotRepo.listOpenFifo({ productId, warehouseId, session })
  const { allocations, shortfall } = allocateFifo(lots, quantity)

  const layers: Layer[] = []
  for (const allocation of allocations) {
    const updated = await StockLotRepo.decrementRemaining({
      id: allocation.lot._id,
      quantity: allocation.quantity,
      session,
    })
    if (!updated)
      throw new HttpError(400, 'Insufficient stock', 'INSUFFICIENT_STOCK')

    layers.push({
      lotId: allocation.lot._id,
      quantity: allocation.quantity,
      minorUnitCost: toMinorType(Number(allocation.lot.minorUnitCost)),
      currencyId: allocation.lot.currencyId,
      receivedAt: allocation.lot.receivedAt,
    })
  }

  if (shortfall > 0) {
    const deficitLayer = await takeDeficitLayer({
      productId,
      warehouseId,
      quantity: shortfall,
      moveId,
      session,
    })
    layers.push(deficitLayer)
  }

  return layers
}

async function takeDeficitLayer({
  productId,
  warehouseId,
  quantity,
  moveId,
  session,
}: {
  productId: string
  warehouseId: string
  quantity: number
  moveId: string
  session?: ClientSession
}): Promise<Layer> {
  const latest = await StockLotRepo.findLatestByReceivedAt({ productId, warehouseId, session })
  if (latest) {
    await StockLotRepo.changeRemaining({
      id: latest._id,
      delta: -quantity,
      session,
    })
    return {
      lotId: latest._id,
      quantity,
      minorUnitCost: toMinorType(Number(latest.minorUnitCost)),
      currencyId: latest.currencyId,
      receivedAt: latest.receivedAt,
    }
  }

  const product = await ProductsRepository.findById(productId, session)
  if (!product)
    throw new HttpError(400, 'Product not found', 'PRODUCT_NOT_FOUND')

  const receivedAt = new Date()
  const lotId = uuidv4()
  await StockLotRepo.createOne({
    payload: {
      _id: lotId,
      productId,
      warehouseId,
      originalCount: 0,
      remainingCount: -quantity,
      minorUnitCost: toMinorType(product.minorPurchasePrice ?? 0),
      currencyId: product.purchaseCurrencyId,
      receivedAt,
      sourceMoveId: moveId,
    },
    session,
  })

  return {
    lotId,
    quantity,
    minorUnitCost: toMinorType(product.minorPurchasePrice ?? 0),
    currencyId: product.purchaseCurrencyId,
    receivedAt,
  }
}

async function placeInboundLots({
  productId,
  warehouseId,
  quantity,
  moveId,
  inboundCost,
  session,
}: {
  productId: string
  warehouseId: string
  quantity: number
  moveId: string
  inboundCost?: PostStockMovePayload['inboundCost']
  session?: ClientSession
}): Promise<Layer[]> {
  const cost = await resolveInboundCost({ productId, inboundCost, session })
  let remainingToPlace = quantity
  const layers: Layer[] = []

  const deficitLots = await StockLotRepo.listDeficitFifo({ productId, warehouseId, session })
  for (const lot of deficitLots) {
    if (remainingToPlace <= 0)
      break

    const hole = -lot.remainingCount
    if (hole <= 0)
      continue

    const fill = Math.min(hole, remainingToPlace)
    await StockLotRepo.changeRemaining({
      id: lot._id,
      delta: fill,
      session,
    })
    layers.push({
      lotId: lot._id,
      quantity: fill,
      minorUnitCost: toMinorType(cost.minorUnitCost),
      currencyId: cost.currencyId,
      receivedAt: cost.receivedAt,
    })
    remainingToPlace -= fill
  }

  if (remainingToPlace > 0) {
    const lotId = uuidv4()
    await StockLotRepo.createOne({
      payload: {
        _id: lotId,
        productId,
        warehouseId,
        originalCount: remainingToPlace,
        remainingCount: remainingToPlace,
        minorUnitCost: toMinorType(cost.minorUnitCost),
        currencyId: cost.currencyId,
        receivedAt: cost.receivedAt,
        sourceMoveId: moveId,
      },
      session,
    })
    layers.push({
      lotId,
      quantity: remainingToPlace,
      minorUnitCost: toMinorType(cost.minorUnitCost),
      currencyId: cost.currencyId,
      receivedAt: cost.receivedAt,
    })
  }

  return layers
}

async function consumeTransitLayers({
  productId,
  quantity,
  documentType,
  documentId,
  session,
}: {
  productId: string
  quantity: number
  documentType: StockMoveDB['documentType']
  documentId: string
  session?: ClientSession
}): Promise<Layer[]> {
  const transitMove = await StockMoveRepo.findOpenTransit({
    documentType,
    documentId,
    productId,
    session,
  })
  if (!transitMove)
    throw new HttpError(400, 'In-transit stock not found', 'STOCK_TRANSIT_NOT_FOUND')
  if (transitMove.openQuantity < quantity)
    throw new HttpError(400, 'Insufficient in-transit stock', 'INSUFFICIENT_STOCK')

  const alreadyReceived = transitMove.quantity - transitMove.openQuantity
  const layers = transitMove.layers.map((layer) => {
    const raw = layer as { toObject?: () => Record<string, unknown> }
    const plain = typeof raw.toObject === 'function' ? raw.toObject() : layer
    return {
      lotId: String(plain.lotId),
      quantity: Number(plain.quantity),
      minorUnitCost: toMinorType(Number(plain.minorUnitCost) || 0),
      currencyId: String(plain.currencyId),
      receivedAt: plain.receivedAt instanceof Date ? plain.receivedAt : new Date(String(plain.receivedAt)),
    }
  })
  const sliced = takeFromLayers(layers, alreadyReceived, quantity)
  const slicedQty = sliced.reduce((sum, layer) => sum + layer.quantity, 0)
  if (slicedQty !== quantity)
    throw new HttpError(400, 'Insufficient in-transit stock', 'INSUFFICIENT_STOCK')

  await StockMoveRepo.changeOpenQuantity({
    id: transitMove._id,
    delta: -quantity,
    session,
  })

  return sliced.map(layer => ({
    lotId: layer.lotId,
    quantity: layer.quantity,
    minorUnitCost: toMinorType(Number(layer.minorUnitCost)),
    currencyId: layer.currencyId,
    receivedAt: layer.receivedAt,
  }))
}

async function resolveInboundCost({
  productId,
  inboundCost,
  session,
}: {
  productId: string
  inboundCost?: PostStockMovePayload['inboundCost']
  session?: ClientSession
}): Promise<{ minorUnitCost: number, currencyId: string, receivedAt: Date }> {
  if (inboundCost) {
    return {
      minorUnitCost: inboundCost.minorUnitCost,
      currencyId: inboundCost.currencyId,
      receivedAt: inboundCost.receivedAt ?? new Date(),
    }
  }

  const product = await ProductsRepository.findById(productId, session)
  if (!product)
    throw new HttpError(400, 'Product not found', 'PRODUCT_NOT_FOUND')

  return {
    minorUnitCost: product.minorPurchasePrice ?? 0,
    currencyId: product.purchaseCurrencyId,
    receivedAt: new Date(),
  }
}

async function ensureLotsFromQuantity({
  productId,
  warehouseId,
  userId,
  session,
}: {
  productId: string
  warehouseId: string
  userId?: string
  session?: ClientSession
}) {
  const lotCount = await StockLotRepo.countByProductWarehouse({ productId, warehouseId, session })
  if (lotCount > 0)
    return

  const quantity = await QuantityRepository.findByProductWarehouse({ productId, warehouseId, session })
  if (!quantity || quantity.count <= 0)
    return

  await post({
    payload: {
      fromKind: 'adjustment',
      toKind: 'warehouse',
      toWarehouseId: warehouseId,
      productId,
      quantity: quantity.count,
      documentType: 'migration',
      documentId: quantity._id,
      userId,
      skipQuantitySync: true,
      inboundCost: undefined,
    },
    session,
  })
}

async function syncQuantityCache({
  fromKind,
  fromWarehouseId,
  toKind,
  toWarehouseId,
  productId,
  session,
}: {
  fromKind: StockLocationKind
  fromWarehouseId?: string | null
  toKind: StockLocationKind
  toWarehouseId?: string | null
  productId: string
  quantity: number
  userId?: string
  documentType: StockMoveDB['documentType']
  documentId: string
  session?: ClientSession
  reverse: boolean
}) {
  if (isWarehouse(fromKind, fromWarehouseId)) {
    await SyncEntryService.syncProductQuantityForWarehouse({
      productId,
      warehouseId: fromWarehouseId,
      session,
    })
  }

  if (isWarehouse(toKind, toWarehouseId)) {
    await SyncEntryService.syncProductQuantityForWarehouse({
      productId,
      warehouseId: toWarehouseId,
      session,
    })
  }
}

function isWarehouse(kind: StockLocationKind, warehouseId: string | null | undefined): warehouseId is string {
  return kind === 'warehouse' && typeof warehouseId === 'string' && warehouseId.length > 0
}

function assertLocation(kind: StockLocationKind, warehouseId: string | null | undefined, side: 'from' | 'to') {
  if (kind === 'warehouse' && !isWarehouse(kind, warehouseId))
    throw new HttpError(400, `Warehouse is required for ${side} location`, 'STOCK_WAREHOUSE_REQUIRED')
}
