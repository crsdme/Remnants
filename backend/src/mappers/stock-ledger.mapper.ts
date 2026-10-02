import type { StockLotDTO, StockMoveDTO, StockMoveLayerDTO } from '@remnant/shared'
import type { StockLotDB, StockMoveDB, StockMoveLayerDB } from '@/types'
import { toMinorType } from '@remnant/shared'

export function mapStockLotToDTO(lot: StockLotDB | {
  _id: string
  productId: string
  warehouseId: string
  originalCount: number
  remainingCount: number
  minorUnitCost: number
  currencyId: string
  receivedAt: Date
  sourceMoveId: string
  createdAt: Date
  updatedAt: Date
}): StockLotDTO {
  return {
    id: lot._id,
    productId: lot.productId,
    warehouseId: lot.warehouseId,
    originalCount: lot.originalCount,
    remainingCount: lot.remainingCount,
    minorUnitCost: toMinorType(lot.minorUnitCost),
    currencyId: lot.currencyId,
    receivedAt: lot.receivedAt,
    sourceMoveId: lot.sourceMoveId,
    createdAt: lot.createdAt,
    updatedAt: lot.updatedAt,
  }
}

export function mapStockMoveLayerToDTO(layer: StockMoveLayerDB): StockMoveLayerDTO {
  return {
    lotId: layer.lotId,
    quantity: layer.quantity,
    minorUnitCost: toMinorType(layer.minorUnitCost),
    currencyId: layer.currencyId,
    receivedAt: layer.receivedAt,
  }
}

export function mapStockMoveToDTO(move: StockMoveDB | {
  _id: string
  productId: string
  fromKind: StockMoveDTO['fromKind']
  toKind: StockMoveDTO['toKind']
  fromWarehouseId?: string | null
  toWarehouseId?: string | null
  quantity: number
  openQuantity: number
  layers: StockMoveLayerDB[]
  documentType: StockMoveDTO['documentType']
  documentId: string
  documentItemId?: string | null
  userId?: string | null
  cancelled: boolean
  cancelledAt?: Date | null
  cancelledBy?: string | null
  createdAt: Date
  updatedAt: Date
}): StockMoveDTO {
  return {
    id: move._id,
    productId: move.productId,
    fromKind: move.fromKind,
    toKind: move.toKind,
    fromWarehouseId: move.fromWarehouseId ?? null,
    toWarehouseId: move.toWarehouseId ?? null,
    quantity: move.quantity,
    openQuantity: move.openQuantity,
    layers: move.layers.map(mapStockMoveLayerToDTO),
    documentType: move.documentType,
    documentId: move.documentId,
    documentItemId: move.documentItemId ?? null,
    userId: move.userId ?? undefined,
    cancelled: move.cancelled,
    cancelledAt: move.cancelledAt ?? null,
    cancelledBy: move.cancelledBy ?? null,
    createdAt: move.createdAt,
    updatedAt: move.updatedAt,
  }
}
