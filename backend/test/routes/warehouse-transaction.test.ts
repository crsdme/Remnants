import { parseResponse } from 'test/helpers/parse-response'
import {
  confirmProcurementResponseSchema,
  createCurrencyResponseSchema,
  createProcurementResponseSchema,
  createUnitResponseSchema,
  createWarehousesResponseSchema,
  createWarehouseTransactionResponseSchema,
  receiveWarehouseTransactionResponseSchema,
  removeWarehouseTransactionsResponseSchema,
  unconfirmProcurementResponseSchema,
} from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import { ProcurementModel, ProductModel, StockLotModel, StockMoveModel, SupplierModel, WarehouseTransactionItemModel, WarehouseTransactionModel } from '@/models'
import * as StockLedger from '@/services/stock-ledger.service'
import * as CurrencyFactory from '../factories/currency.factory'
import * as ProcurementFactory from '../factories/procurement.factory'
import * as UnitFactory from '../factories/unit.factory'
import * as WarehouseTransactionFactory from '../factories/warehouse-transaction.factory'
import * as WarehouseFactory from '../factories/warehouse.factory'

describe('warehouse transaction ledger', () => {
  afterEach(async () => {
    await WarehouseTransactionFactory.removeAll()
    await WarehouseTransactionItemModel.deleteMany({})
    await StockLotModel.deleteMany({})
    await StockMoveModel.deleteMany({})
    await ProductModel.deleteMany({})
    await ProcurementFactory.removeAll()
    await SupplierModel.deleteMany({})
    await WarehouseFactory.removeAll()
    await CurrencyFactory.removeAll()
    await UnitFactory.removeAll()
  })

  it('posts in/out/transfer through ledger and cancel restores stock', async () => {
    const currency = parseResponse(createCurrencyResponseSchema, await CurrencyFactory.create({
      names: { en: 'Hryvnia', ru: 'Гривна' },
      symbols: { en: 'UAH', ru: 'грн' },
      scale: 2,
      paymentEpsilon: 0.01,
      priority: 1,
      active: true,
    }))
    const unit = parseResponse(createUnitResponseSchema, await UnitFactory.create({
      names: { en: 'pcs', ru: 'шт' },
      symbols: { en: 'pcs', ru: 'шт' },
      priority: 1,
      active: true,
    }))
    const warehouseA = parseResponse(createWarehousesResponseSchema, await WarehouseFactory.create({
      names: { en: 'Shop A', ru: 'Магазин A' },
      priority: 1,
      active: true,
    }))
    const warehouseB = parseResponse(createWarehousesResponseSchema, await WarehouseFactory.create({
      names: { en: 'Shop B', ru: 'Магазин B' },
      priority: 2,
      active: true,
    }))

    const product = await ProductModel.create({
      names: { en: 'Widget', ru: 'Виджет' },
      minorPrice: 20000,
      currencyId: currency.data.id,
      minorPurchasePrice: 10000,
      purchaseCurrencyId: currency.data.id,
      unitId: unit.data.id,
      categoryIds: [],
      images: [],
      productProperties: [],
      barcodeIds: [],
      quantityIds: [],
    })

    const inbound = parseResponse(createWarehouseTransactionResponseSchema, await WarehouseTransactionFactory.create({
      type: 'in',
      toWarehouseId: warehouseA.data.id,
      products: [{
        id: product._id,
        quantity: 10,
        minorPurchasePrice: 10000,
        purchaseCurrencyId: currency.data.id,
      }],
    }))
    expect(inbound.code).toBe('WAREHOUSE_TRANSACTION_CREATED')
    expect(await StockLedger.onHand({ productId: product._id, warehouseId: warehouseA.data.id })).toBe(10)

    const inboundMove = await StockMoveModel.findOne({ productId: product._id, documentType: 'warehouse-transaction', cancelled: false }).sort({ createdAt: -1 })
    expect(inboundMove?.fromKind).toBe('adjustment')
    expect(inboundMove?.toKind).toBe('warehouse')

    parseResponse(createWarehouseTransactionResponseSchema, await WarehouseTransactionFactory.create({
      type: 'out',
      fromWarehouseId: warehouseA.data.id,
      products: [{ id: product._id, quantity: 3 }],
    }))
    expect(await StockLedger.onHand({ productId: product._id, warehouseId: warehouseA.data.id })).toBe(7)

    parseResponse(createWarehouseTransactionResponseSchema, await WarehouseTransactionFactory.create({
      type: 'transfer',
      fromWarehouseId: warehouseA.data.id,
      toWarehouseId: warehouseB.data.id,
      requiresReceiving: false,
      products: [{ id: product._id, quantity: 2 }],
    }))
    expect(await StockLedger.onHand({ productId: product._id, warehouseId: warehouseA.data.id })).toBe(5)
    expect(await StockLedger.onHand({ productId: product._id, warehouseId: warehouseB.data.id })).toBe(2)

    const awaiting = parseResponse(createWarehouseTransactionResponseSchema, await WarehouseTransactionFactory.create({
      type: 'transfer',
      fromWarehouseId: warehouseA.data.id,
      toWarehouseId: warehouseB.data.id,
      requiresReceiving: true,
      products: [{ id: product._id, quantity: 1 }],
    }))
    expect(awaiting.code).toBe('WAREHOUSE_TRANSACTION_CREATED')
    expect(await StockLedger.onHand({ productId: product._id, warehouseId: warehouseA.data.id })).toBe(4)
    expect(await StockLedger.onHand({ productId: product._id, warehouseId: warehouseB.data.id })).toBe(2)

    const awaitingDoc = await WarehouseTransactionModel.findOne({
      type: 'transfer',
      status: 'awaiting',
      toWarehouseId: warehouseB.data.id,
    }).sort({ createdAt: -1 })
    expect(awaitingDoc).not.toBeNull()

    parseResponse(receiveWarehouseTransactionResponseSchema, await WarehouseTransactionFactory.receive({
      id: String(awaitingDoc!._id),
      products: [{ id: product._id, quantity: 1, receivedQuantity: 1 }],
    }))
    expect(await StockLedger.onHand({ productId: product._id, warehouseId: warehouseB.data.id })).toBe(3)

    parseResponse(createWarehouseTransactionResponseSchema, await WarehouseTransactionFactory.create({
      type: 'in',
      toWarehouseId: warehouseA.data.id,
      products: [{
        id: product._id,
        quantity: 5,
        minorPurchasePrice: 10000,
        purchaseCurrencyId: currency.data.id,
      }],
    }))
    expect(await StockLedger.onHand({ productId: product._id, warehouseId: warehouseA.data.id })).toBe(9)

    const unusedIn = await WarehouseTransactionModel.findOne({
      type: 'in',
      toWarehouseId: warehouseA.data.id,
      status: { $ne: 'cancelled' },
    }).sort({ seq: -1 })
    expect(unusedIn).not.toBeNull()
    parseResponse(removeWarehouseTransactionsResponseSchema, await WarehouseTransactionFactory.remove({
      ids: [String(unusedIn!._id)],
    }))
    expect(await StockLedger.onHand({ productId: product._id, warehouseId: warehouseA.data.id })).toBe(4)
  })

  it('confirming a procurement creates awaiting inbound that receives lots without posting stock until receipt', async () => {
    const currency = parseResponse(createCurrencyResponseSchema, await CurrencyFactory.create({
      names: { en: 'Hryvnia', ru: 'Гривна' },
      symbols: { en: 'UAH', ru: 'грн' },
      scale: 2,
      paymentEpsilon: 0.01,
      priority: 1,
      active: true,
    }))
    const unit = parseResponse(createUnitResponseSchema, await UnitFactory.create({
      names: { en: 'pcs', ru: 'шт' },
      symbols: { en: 'pcs', ru: 'шт' },
      priority: 1,
      active: true,
    }))
    const warehouse = parseResponse(createWarehousesResponseSchema, await WarehouseFactory.create({
      names: { en: 'Shop', ru: 'Магазин' },
      priority: 1,
      active: true,
    }))
    const supplier = await SupplierModel.create({ name: 'Acme' })
    const product = await ProductModel.create({
      names: { en: 'Widget', ru: 'Виджет' },
      minorPrice: 20000,
      currencyId: currency.data.id,
      minorPurchasePrice: 10000,
      purchaseCurrencyId: currency.data.id,
      unitId: unit.data.id,
      categoryIds: [],
      images: [],
      productProperties: [],
      barcodeIds: [],
      quantityIds: [],
    })

    const created = parseResponse(createProcurementResponseSchema, await ProcurementFactory.create({
      supplierId: supplier._id,
      warehouseId: warehouse.data.id,
      items: [{
        id: product._id,
        quantity: 10,
        purchasePrice: 100,
        purchaseCurrencyId: { id: currency.data.id },
      }],
    }))
    expect(created.data.status).toBe('draft')

    const confirmed = parseResponse(confirmProcurementResponseSchema, await ProcurementFactory.confirm({
      id: created.data.id,
      warehouseId: warehouse.data.id,
    }))
    expect(confirmed.code).toBe('PROCUREMENT_CONFIRMED')
    expect(confirmed.data.status).toBe('ordered')
    expect(await StockLedger.onHand({ productId: product._id, warehouseId: warehouse.data.id })).toBe(0)

    const inbound = await WarehouseTransactionModel.findOne({
      sourceModel: 'procurement',
      sourceId: created.data.id,
      removed: { $ne: true },
    })
    expect(inbound).not.toBeNull()
    expect(inbound?.type).toBe('in')
    expect(inbound?.status).toBe('awaiting')
    expect(inbound?.toWarehouseId).toBe(warehouse.data.id)

    parseResponse(receiveWarehouseTransactionResponseSchema, await WarehouseTransactionFactory.receive({
      id: String(inbound!._id),
      products: [{ id: product._id, quantity: 10, receivedQuantity: 4 }],
    }))
    expect(await StockLedger.onHand({ productId: product._id, warehouseId: warehouse.data.id })).toBe(4)

    const afterPartial = await WarehouseTransactionModel.findById(inbound!._id)
    expect(afterPartial?.status).toBe('received')
    expect(afterPartial?.accepted).toBe(true)

    const partialProcurement = await ProcurementModel.findById(created.data.id)
    expect(partialProcurement?.status).toBe('partially-received')

    const lot = await StockLotModel.findOne({ productId: product._id, warehouseId: warehouse.data.id })
    expect(lot?.remainingCount).toBe(4)
    expect(lot?.minorUnitCost).toBe(10000)
    expect(lot?.currencyId).toBe(currency.data.id)

    const secondReceive = await WarehouseTransactionFactory.receive({
      id: String(inbound!._id),
      products: [{ id: product._id, quantity: 10, receivedQuantity: 6 }],
    }) as { error?: { code?: string } }
    expect(secondReceive.error?.code).toBe('WAREHOUSE_TRANSACTION_NOT_AWAITING')
    expect(await StockLedger.onHand({ productId: product._id, warehouseId: warehouse.data.id })).toBe(4)
  })

  it('allows inbound overage when received quantity is greater than ordered', async () => {
    const currency = parseResponse(createCurrencyResponseSchema, await CurrencyFactory.create({
      names: { en: 'Hryvnia', ru: 'Гривна' },
      symbols: { en: 'UAH', ru: 'грн' },
      scale: 2,
      paymentEpsilon: 0.01,
      priority: 1,
      active: true,
    }))
    const unit = parseResponse(createUnitResponseSchema, await UnitFactory.create({
      names: { en: 'pcs', ru: 'шт' },
      symbols: { en: 'pcs', ru: 'шт' },
      priority: 1,
      active: true,
    }))
    const warehouse = parseResponse(createWarehousesResponseSchema, await WarehouseFactory.create({
      names: { en: 'Shop', ru: 'Магазин' },
      priority: 1,
      active: true,
    }))
    const supplier = await SupplierModel.create({ name: 'Acme' })
    const more = await ProductModel.create({
      names: { en: 'More', ru: 'Больше' },
      minorPrice: 20000,
      currencyId: currency.data.id,
      minorPurchasePrice: 10000,
      purchaseCurrencyId: currency.data.id,
      unitId: unit.data.id,
      categoryIds: [],
      images: [],
      productProperties: [],
      barcodeIds: [],
      quantityIds: [],
    })
    const less = await ProductModel.create({
      names: { en: 'Less', ru: 'Меньше' },
      minorPrice: 20000,
      currencyId: currency.data.id,
      minorPurchasePrice: 10000,
      purchaseCurrencyId: currency.data.id,
      unitId: unit.data.id,
      categoryIds: [],
      images: [],
      productProperties: [],
      barcodeIds: [],
      quantityIds: [],
    })

    const created = parseResponse(createProcurementResponseSchema, await ProcurementFactory.create({
      supplierId: supplier._id,
      warehouseId: warehouse.data.id,
      items: [
        { id: more._id, quantity: 5, purchasePrice: 100, purchaseCurrencyId: { id: currency.data.id } },
        { id: less._id, quantity: 5, purchasePrice: 100, purchaseCurrencyId: { id: currency.data.id } },
      ],
    }))

    parseResponse(confirmProcurementResponseSchema, await ProcurementFactory.confirm({
      id: created.data.id,
      warehouseId: warehouse.data.id,
    }))

    const inbound = await WarehouseTransactionModel.findOne({
      sourceModel: 'procurement',
      sourceId: created.data.id,
      removed: { $ne: true },
    })
    expect(inbound).not.toBeNull()

    parseResponse(receiveWarehouseTransactionResponseSchema, await WarehouseTransactionFactory.receive({
      id: String(inbound!._id),
      products: [
        { id: more._id, quantity: 5, receivedQuantity: 7 },
        { id: less._id, quantity: 5, receivedQuantity: 4 },
      ],
    }))

    expect(await StockLedger.onHand({ productId: more._id, warehouseId: warehouse.data.id })).toBe(7)
    expect(await StockLedger.onHand({ productId: less._id, warehouseId: warehouse.data.id })).toBe(4)

    const afterReceive = await WarehouseTransactionModel.findById(inbound!._id)
    expect(afterReceive?.status).toBe('received')
    expect(afterReceive?.accepted).toBe(true)

    const moreItem = await WarehouseTransactionItemModel.findOne({ transactionId: inbound!._id, productId: more._id })
    const lessItem = await WarehouseTransactionItemModel.findOne({ transactionId: inbound!._id, productId: less._id })
    expect(moreItem?.receivedQuantity).toBe(7)
    expect(lessItem?.receivedQuantity).toBe(4)
  })

  it('unconfirms an unused inbound and allows changing warehouse on receive', async () => {
    const currency = parseResponse(createCurrencyResponseSchema, await CurrencyFactory.create({
      names: { en: 'Hryvnia', ru: 'Гривна' },
      symbols: { en: 'UAH', ru: 'грн' },
      scale: 2,
      paymentEpsilon: 0.01,
      priority: 1,
      active: true,
    }))
    const unit = parseResponse(createUnitResponseSchema, await UnitFactory.create({
      names: { en: 'pcs', ru: 'шт' },
      symbols: { en: 'pcs', ru: 'шт' },
      priority: 1,
      active: true,
    }))
    const warehouseA = parseResponse(createWarehousesResponseSchema, await WarehouseFactory.create({
      names: { en: 'Shop A', ru: 'Магазин А' },
      priority: 1,
      active: true,
    }))
    const warehouseB = parseResponse(createWarehousesResponseSchema, await WarehouseFactory.create({
      names: { en: 'Shop B', ru: 'Магазин Б' },
      priority: 2,
      active: true,
    }))
    const supplier = await SupplierModel.create({ name: 'Acme' })
    const product = await ProductModel.create({
      names: { en: 'Widget', ru: 'Виджет' },
      minorPrice: 20000,
      currencyId: currency.data.id,
      minorPurchasePrice: 10000,
      purchaseCurrencyId: currency.data.id,
      unitId: unit.data.id,
      categoryIds: [],
      images: [],
      productProperties: [],
      barcodeIds: [],
      quantityIds: [],
    })

    const created = parseResponse(createProcurementResponseSchema, await ProcurementFactory.create({
      supplierId: supplier._id,
      warehouseId: warehouseA.data.id,
      items: [{
        id: product._id,
        quantity: 10,
        purchasePrice: 100,
        purchaseCurrencyId: { id: currency.data.id },
      }],
    }))

    parseResponse(confirmProcurementResponseSchema, await ProcurementFactory.confirm({
      id: created.data.id,
      warehouseId: warehouseA.data.id,
    }))

    const inbound = await WarehouseTransactionModel.findOne({
      sourceModel: 'procurement',
      sourceId: created.data.id,
      removed: { $ne: true },
    })
    expect(inbound).not.toBeNull()

    parseResponse(unconfirmProcurementResponseSchema, await ProcurementFactory.unconfirm({
      id: created.data.id,
    }))

    const withdrawn = await WarehouseTransactionModel.findById(inbound!._id)
    expect(withdrawn?.removed).toBe(true)

    const draft = await ProcurementModel.findById(created.data.id)
    expect(draft?.status).toBe('draft')

    parseResponse(confirmProcurementResponseSchema, await ProcurementFactory.confirm({
      id: created.data.id,
      warehouseId: warehouseA.data.id,
    }))

    const inboundAgain = await WarehouseTransactionModel.findOne({
      sourceModel: 'procurement',
      sourceId: created.data.id,
      removed: { $ne: true },
    })
    expect(inboundAgain).not.toBeNull()

    parseResponse(receiveWarehouseTransactionResponseSchema, await WarehouseTransactionFactory.receive({
      id: String(inboundAgain!._id),
      toWarehouseId: warehouseB.data.id,
      products: [{ id: product._id, quantity: 10, receivedQuantity: 4 }],
    }))

    expect(await StockLedger.onHand({ productId: product._id, warehouseId: warehouseA.data.id })).toBe(0)
    expect(await StockLedger.onHand({ productId: product._id, warehouseId: warehouseB.data.id })).toBe(4)

    const receivedInbound = await WarehouseTransactionModel.findById(inboundAgain!._id)
    expect(receivedInbound?.status).toBe('received')
    expect(receivedInbound?.toWarehouseId).toBe(warehouseB.data.id)

    const receivedProcurement = await ProcurementModel.findById(created.data.id)
    expect(receivedProcurement?.warehouseId).toBe(warehouseB.data.id)
    expect(receivedProcurement?.status).toBe('partially-received')
  })
})
