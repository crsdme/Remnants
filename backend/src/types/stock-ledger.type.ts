import type { StockLotDTO, StockMovePopulatedDTO } from '@remnant/shared'
import type { z } from 'zod'
import type { stockLotDBSchema, stockMoveDBSchema, stockMoveLayerDBSchema } from '../schemas'
import { getStockLotsSchema, getStockMovesSchema } from '@remnant/shared'

export type StockLotDB = z.infer<typeof stockLotDBSchema>
export type StockMoveLayerDB = z.infer<typeof stockMoveLayerDBSchema>
export type StockMoveDB = z.infer<typeof stockMoveDBSchema>

export type GetStockMovesPayload = z.output<typeof getStockMovesSchema>
export function parseGetStockMoves(x: unknown): GetStockMovesPayload {
  return getStockMovesSchema.parse(x)
}

export type GetStockLotsPayload = z.output<typeof getStockLotsSchema>
export function parseGetStockLots(x: unknown): GetStockLotsPayload {
  return getStockLotsSchema.parse(x)
}

export interface GetStockMovesRepoResult {
  items: StockMovePopulatedDTO[]
  total: number
  page: number
  pageSize: number
}

export interface GetStockLotsRepoResult {
  items: Array<StockLotDTO & { id: string }>
  total: number
  page: number
  pageSize: number
}

export interface CreateStockLotRepoPayload {
  _id: string
  productId: string
  warehouseId: string
  originalCount: number
  remainingCount: number
  minorUnitCost: number
  currencyId: string
  receivedAt: Date
  sourceMoveId: string
}

export interface CreateStockMoveRepoPayload {
  _id: string
  productId: string
  fromKind: StockMoveDB['fromKind']
  toKind: StockMoveDB['toKind']
  fromWarehouseId?: string | null
  toWarehouseId?: string | null
  quantity: number
  openQuantity: number
  layers: Array<{
    lotId: string
    quantity: number
    minorUnitCost: number
    currencyId: string
    receivedAt: Date
  }>
  documentType: StockMoveDB['documentType']
  documentId: string
  documentItemId?: string | null
  userId?: string | null
  cancelled: boolean
  cancelledAt?: Date | null
  cancelledBy?: string | null
}
