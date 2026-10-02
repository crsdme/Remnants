import type {
  CreateProductStockStatusResponse,
  EditProductStockStatusResponse,
  GetProductStockStatusesResponse,
  ProductStockStatusCondition,
  ProductStockStatusDTO,
  RemoveProductStockStatusesResponse,
} from '@remnant/shared'
import type { ClientSession } from 'mongoose'
import type {
  CreateProductStockStatusPayload,
  EditProductStockStatusPayload,
  GetProductStockStatusesPayload,
  RemoveProductStockStatusesPayload,
} from '@/types'
import { mapProductStockStatusToDTO } from '@/mappers'
import * as ProductStockStatusRepo from '@/repositories/product-stock-status.repo'
import * as StockLotRepo from '@/repositories/stock-lot.repo'
import * as StockMoveRepo from '@/repositories/stock-move.repo'
import { HttpError } from '@/utils/'

const DAY_MS = 24 * 60 * 60 * 1000

export interface StockStatusContext {
  qty: number
  daysSinceLastSale: number
  daysSinceQtyChange: number
}

function matchCondition(condition: ProductStockStatusCondition, ctx: StockStatusContext): boolean {
  const left = ctx[condition.field]
  const right = condition.value

  switch (condition.operator) {
    case 'eq':
      return left === right
    case 'neq':
      return left !== right
    case 'lt':
      return left < right
    case 'lte':
      return left <= right
    case 'gt':
      return left > right
    case 'gte':
      return left >= right
    default:
      return false
  }
}

export function pickMatchingStatus(
  statuses: ProductStockStatusDTO[],
  ctx: StockStatusContext,
): ProductStockStatusDTO | null {
  const sorted = [...statuses].sort((a, b) => a.priority - b.priority)
  const fallback = sorted.find(s => s.isDefault) ?? null

  for (const status of sorted) {
    if (status.isDefault)
      continue
    if (!status.conditions?.length)
      continue
    if (status.conditions.every(c => matchCondition(c, ctx)))
      return status
  }

  return fallback
}

function buildContext(quantity: {
  count: number
  updatedAt?: Date
  createdAt?: Date
  lastSaleAt?: Date | null
}): StockStatusContext {
  const now = Date.now()
  const qtyChangedAt = quantity.updatedAt ?? quantity.createdAt ?? new Date()
  const daysSinceQtyChange = Math.floor((now - new Date(qtyChangedAt).getTime()) / DAY_MS)
  const daysSinceLastSale = quantity.lastSaleAt
    ? Math.floor((now - new Date(quantity.lastSaleAt).getTime()) / DAY_MS)
    : Number.POSITIVE_INFINITY

  return {
    qty: quantity.count ?? 0,
    daysSinceLastSale,
    daysSinceQtyChange,
  }
}

function buildContextFromStock(stock: {
  count: number
  lastSaleAt?: Date | null
  lastMoveAt?: Date | null
}): StockStatusContext {
  return buildContext({
    count: stock.count,
    lastSaleAt: stock.lastSaleAt,
    updatedAt: stock.lastMoveAt ?? undefined,
    createdAt: stock.lastMoveAt ?? undefined,
  })
}

export async function listActiveStatuses(): Promise<ProductStockStatusDTO[]> {
  return (await ProductStockStatusRepo.listActive()).map(mapProductStockStatusToDTO)
}

export async function decorateWarehouseStock(
  stocks: Array<{
    warehouseId: string
    count: number
    lastSaleAt?: Date | null
    lastMoveAt?: Date | null
  }>,
  preloadedStatuses?: ProductStockStatusDTO[],
): Promise<Array<{
  warehouseId: string
  count: number
  stockStatus: ProductStockStatusDTO | null
}>> {
  if (stocks.length === 0)
    return []

  const statuses = preloadedStatuses ?? (await ProductStockStatusRepo.listActive()).map(mapProductStockStatusToDTO)
  return stocks.map(stock => ({
    warehouseId: stock.warehouseId,
    count: stock.count,
    stockStatus: pickMatchingStatus(statuses, buildContextFromStock(stock)),
  }))
}

export async function listProductIdsMatchingStatus({
  warehouseId,
  stockStatusId,
}: {
  warehouseId: string
  stockStatusId: string
}): Promise<string[]> {
  const [rows, lastSales, lastMoves, statusDocs] = await Promise.all([
    StockLotRepo.listRemainingByWarehouse(warehouseId),
    StockMoveRepo.listLastCustomerSaleAtByWarehouse(warehouseId),
    StockMoveRepo.listLastMoveAtByWarehouse(warehouseId),
    ProductStockStatusRepo.listActive(),
  ])

  const statuses = statusDocs.map(mapProductStockStatusToDTO)
  const lastSaleByProduct = new Map(lastSales.map(row => [row.productId, row.lastSaleAt]))
  const lastMoveByProduct = new Map(lastMoves.map(row => [row.productId, row.lastMoveAt]))

  return rows
    .filter((row) => {
      const matched = pickMatchingStatus(statuses, buildContextFromStock({
        count: row.count,
        lastSaleAt: lastSaleByProduct.get(row.productId) ?? null,
        lastMoveAt: lastMoveByProduct.get(row.productId) ?? null,
      }))
      return matched?.id === stockStatusId
    })
    .map(row => row.productId)
}

export async function recomputeForProductWarehouse({
  productId,
  warehouseId,
  session,
}: {
  productId: string
  warehouseId: string
  session?: ClientSession
}): Promise<ProductStockStatusDTO | null> {
  const qty = await StockLotRepo.sumRemaining({ productId, warehouseId, session })
  const lastSale = await StockMoveRepo.findLastCustomerMove({ productId, warehouseId, session })
  const lastMove = await StockMoveRepo.findLastWarehouseMove({ productId, warehouseId, session })
  const statuses = (await ProductStockStatusRepo.listActive()).map(mapProductStockStatusToDTO)
  return pickMatchingStatus(statuses, buildContextFromStock({
    count: qty,
    lastSaleAt: lastSale?.createdAt ?? null,
    lastMoveAt: lastMove?.createdAt ?? null,
  }))
}

export async function recomputeAll(options: { session?: ClientSession } = {}): Promise<number> {
  const pairs = await StockLotRepo.listProductWarehousePairs(options.session)
  let updated = 0

  for (const pair of pairs) {
    await recomputeForProductWarehouse({
      productId: pair.productId,
      warehouseId: pair.warehouseId,
      session: options.session,
    })
    updated += 1
  }

  return updated
}

function scheduleRecomputeAll() {
  void recomputeAll().catch((error) => {
    console.error('[product-stock-status] bulk recompute failed', error)
  })
}

export async function get({
  payload,
}: {
  payload: GetProductStockStatusesPayload
}): Promise<GetProductStockStatusesResponse> {
  const { items, total, page, pageSize } = await ProductStockStatusRepo.list(payload)

  return {
    status: 'success',
    code: 'PRODUCT_STOCK_STATUSES_FETCHED',
    message: 'Product stock statuses fetched',
    data: {
      items,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function create({ payload }: { payload: CreateProductStockStatusPayload }): Promise<CreateProductStockStatusResponse> {
  if (payload.isDefault)
    await ProductStockStatusRepo.unsetDefaults()

  const status = await ProductStockStatusRepo.createOne(payload)
  scheduleRecomputeAll()

  return {
    status: 'success',
    code: 'PRODUCT_STOCK_STATUS_CREATED',
    message: 'Product stock status created',
    data: mapProductStockStatusToDTO(status),
  }
}

export async function edit({ payload }: { payload: EditProductStockStatusPayload }): Promise<EditProductStockStatusResponse> {
  const { id } = payload

  if (payload.isDefault)
    await ProductStockStatusRepo.unsetDefaults(id)

  const status = await ProductStockStatusRepo.updateById(id, payload)

  if (!status) {
    throw new HttpError(400, 'Product stock status not edited', 'PRODUCT_STOCK_STATUS_NOT_EDITED')
  }

  scheduleRecomputeAll()

  return {
    status: 'success',
    code: 'PRODUCT_STOCK_STATUS_EDITED',
    message: 'Product stock status edited',
    data: mapProductStockStatusToDTO(status),
  }
}

export async function remove({ payload }: { payload: RemoveProductStockStatusesPayload }): Promise<RemoveProductStockStatusesResponse> {
  for (const id of payload.ids) {
    await ProductStockStatusRepo.removeById(id)
  }

  scheduleRecomputeAll()

  return {
    status: 'success',
    code: 'PRODUCT_STOCK_STATUSES_REMOVED',
    message: 'Product stock statuses removed',
  }
}
