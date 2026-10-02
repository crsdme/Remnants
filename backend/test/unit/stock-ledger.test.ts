import { v4 as uuidv4 } from 'uuid'
import { afterEach, describe, expect, it } from 'vitest'
import { StockLotModel, StockMoveModel } from '@/models'
import * as StockLedger from '@/services/stock-ledger.service'

const PRODUCT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const CURRENCY_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
const WAREHOUSE_A = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
const WAREHOUSE_B = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
const USER_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'

async function inbound(warehouseId: string, quantity: number, minorUnitCost: number, documentId = uuidv4()) {
  return StockLedger.post({
    payload: {
      fromKind: 'adjustment',
      toKind: 'warehouse',
      toWarehouseId: warehouseId,
      productId: PRODUCT_ID,
      quantity,
      documentType: 'warehouse-transaction',
      documentId,
      userId: USER_ID,
      skipQuantitySync: true,
      inboundCost: {
        minorUnitCost,
        currencyId: CURRENCY_ID,
      },
    },
  })
}

describe('stock ledger FIFO', () => {
  afterEach(async () => {
    await StockLotModel.deleteMany({})
    await StockMoveModel.deleteMany({})
  })

  it('sells remaining 5 at 100 then 3 at 150', async () => {
    await inbound(WAREHOUSE_A, 50, 10000)
    await StockLedger.post({
      payload: {
        fromKind: 'warehouse',
        fromWarehouseId: WAREHOUSE_A,
        toKind: 'customer',
        productId: PRODUCT_ID,
        quantity: 45,
        documentType: 'order',
        documentId: uuidv4(),
        userId: USER_ID,
        skipQuantitySync: true,
      },
    })
    await inbound(WAREHOUSE_A, 50, 15000)

    const sale = await StockLedger.post({
      payload: {
        fromKind: 'warehouse',
        fromWarehouseId: WAREHOUSE_A,
        toKind: 'customer',
        productId: PRODUCT_ID,
        quantity: 8,
        documentType: 'order',
        documentId: uuidv4(),
        userId: USER_ID,
        skipQuantitySync: true,
      },
    })

    expect(sale.layers.map(layer => ({ quantity: layer.quantity, cost: Number(layer.minorUnitCost) }))).toEqual([
      { quantity: 5, cost: 10000 },
      { quantity: 3, cost: 15000 },
    ])
    expect(sale.weightedMinorUnitCost).toBe(11875)
    expect(await StockLedger.onHand({ productId: PRODUCT_ID, warehouseId: WAREHOUSE_A })).toBe(47)
  })

  it('keeps cost and receivedAt when transferring between warehouses', async () => {
    const first = await inbound(WAREHOUSE_A, 50, 10000)
    const receivedAt = first.layers[0].receivedAt

    await StockLedger.post({
      payload: {
        fromKind: 'warehouse',
        fromWarehouseId: WAREHOUSE_A,
        toKind: 'warehouse',
        toWarehouseId: WAREHOUSE_B,
        productId: PRODUCT_ID,
        quantity: 5,
        documentType: 'warehouse-transaction',
        documentId: uuidv4(),
        userId: USER_ID,
        skipQuantitySync: true,
      },
    })

    const lotsB = await StockLotModel.find({ productId: PRODUCT_ID, warehouseId: WAREHOUSE_B }).lean()
    expect(lotsB).toHaveLength(1)
    expect(lotsB[0].remainingCount).toBe(5)
    expect(lotsB[0].minorUnitCost).toBe(10000)
    expect(new Date(lotsB[0].receivedAt).getTime()).toBe(new Date(receivedAt).getTime())
    expect(await StockLedger.onHand({ productId: PRODUCT_ID, warehouseId: WAREHOUSE_A })).toBe(45)
    expect(await StockLedger.onHand({ productId: PRODUCT_ID, warehouseId: WAREHOUSE_B })).toBe(5)
  })

  it('restores lots when a sale is cancelled', async () => {
    await inbound(WAREHOUSE_A, 50, 10000)
    const orderId = uuidv4()
    await StockLedger.post({
      payload: {
        fromKind: 'warehouse',
        fromWarehouseId: WAREHOUSE_A,
        toKind: 'customer',
        productId: PRODUCT_ID,
        quantity: 12,
        documentType: 'order',
        documentId: orderId,
        userId: USER_ID,
        skipQuantitySync: true,
      },
    })

    expect(await StockLedger.onHand({ productId: PRODUCT_ID, warehouseId: WAREHOUSE_A })).toBe(38)

    await StockLedger.cancel({
      documentType: 'order',
      documentId: orderId,
      userId: USER_ID,
      skipQuantitySync: true,
    })

    expect(await StockLedger.onHand({ productId: PRODUCT_ID, warehouseId: WAREHOUSE_A })).toBe(50)
  })

  it('sells into deficit at last lot cost', async () => {
    await inbound(WAREHOUSE_A, 3, 10000)
    const sale = await StockLedger.post({
      payload: {
        fromKind: 'warehouse',
        fromWarehouseId: WAREHOUSE_A,
        toKind: 'customer',
        productId: PRODUCT_ID,
        quantity: 10,
        documentType: 'order',
        documentId: uuidv4(),
        userId: USER_ID,
        skipQuantitySync: true,
      },
    })

    expect(await StockLedger.onHand({ productId: PRODUCT_ID, warehouseId: WAREHOUSE_A })).toBe(-7)
    expect(sale.layers.map(layer => ({ quantity: layer.quantity, cost: Number(layer.minorUnitCost) }))).toEqual([
      { quantity: 3, cost: 10000 },
      { quantity: 7, cost: 10000 },
    ])
  })

  it('nets deficit on inbound then opens a new lot at inbound cost', async () => {
    await inbound(WAREHOUSE_A, 3, 10000)
    await StockLedger.post({
      payload: {
        fromKind: 'warehouse',
        fromWarehouseId: WAREHOUSE_A,
        toKind: 'customer',
        productId: PRODUCT_ID,
        quantity: 10,
        documentType: 'order',
        documentId: uuidv4(),
        userId: USER_ID,
        skipQuantitySync: true,
      },
    })

    await inbound(WAREHOUSE_A, 50, 15000)

    expect(await StockLedger.onHand({ productId: PRODUCT_ID, warehouseId: WAREHOUSE_A })).toBe(43)
    const lots = await StockLotModel.find({ productId: PRODUCT_ID, warehouseId: WAREHOUSE_A }).sort({ receivedAt: 1 }).lean()
    const leftover = lots.find(lot => lot.remainingCount > 0)
    expect(leftover?.remainingCount).toBe(43)
    expect(leftover?.minorUnitCost).toBe(15000)
    expect(lots.every(lot => lot.remainingCount >= 0)).toBe(true)
  })

  it('restores onHand when a deficit sale is cancelled', async () => {
    await inbound(WAREHOUSE_A, 3, 10000)
    const orderId = uuidv4()
    await StockLedger.post({
      payload: {
        fromKind: 'warehouse',
        fromWarehouseId: WAREHOUSE_A,
        toKind: 'customer',
        productId: PRODUCT_ID,
        quantity: 10,
        documentType: 'order',
        documentId: orderId,
        userId: USER_ID,
        skipQuantitySync: true,
      },
    })

    expect(await StockLedger.onHand({ productId: PRODUCT_ID, warehouseId: WAREHOUSE_A })).toBe(-7)

    await StockLedger.cancel({
      documentType: 'order',
      documentId: orderId,
      userId: USER_ID,
      skipQuantitySync: true,
    })

    expect(await StockLedger.onHand({ productId: PRODUCT_ID, warehouseId: WAREHOUSE_A })).toBe(3)
  })

  it('keeps lot remainder equal to inbound minus uncancelled outbound', async () => {
    await inbound(WAREHOUSE_A, 50, 10000)
    const orderId = uuidv4()
    await StockLedger.post({
      payload: {
        fromKind: 'warehouse',
        fromWarehouseId: WAREHOUSE_A,
        toKind: 'customer',
        productId: PRODUCT_ID,
        quantity: 12,
        documentType: 'order',
        documentId: orderId,
        userId: USER_ID,
        skipQuantitySync: true,
      },
    })

    const inboundQty = await StockMoveModel.aggregate<{ total: number }>([
      { $match: { productId: PRODUCT_ID, toWarehouseId: WAREHOUSE_A, cancelled: false } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ])
    const outboundQty = await StockMoveModel.aggregate<{ total: number }>([
      { $match: { productId: PRODUCT_ID, fromWarehouseId: WAREHOUSE_A, cancelled: false } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ])
    const lotsSum = await StockLedger.onHand({ productId: PRODUCT_ID, warehouseId: WAREHOUSE_A })
    expect(lotsSum).toBe((inboundQty[0]?.total ?? 0) - (outboundQty[0]?.total ?? 0))
  })
})
