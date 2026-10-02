import { parseResponse } from 'test/helpers/parse-response'
import {
  createCashregisterAccountResponseSchema,
  createCashregisterResponseSchema,
  createCurrencyResponseSchema,
  createUnitResponseSchema,
  createWarehousesResponseSchema,
  getCurrentBalanceResponseSchema,
} from '@remnant/shared'
import { v4 as uuidv4 } from 'uuid'
import { afterEach, describe, expect, it } from 'vitest'
import {
  ClientModel,
  MoneyTransactionModel,
  OrderItemModel,
  OrderModel,
  PaymentApplicationModel,
  ProcurementItemModel,
  ProcurementModel,
  ProductModel,
  StockLotModel,
  StockMoveModel,
  SupplierModel,
} from '@/models'
import * as BalanceFactory from '../factories/balance.factory'
import * as CashregisterAccountFactory from '../factories/cashregister-account.factory'
import * as CashregisterFactory from '../factories/cashregister.factory'
import * as CurrencyFactory from '../factories/currency.factory'
import * as MoneyTransactionFactory from '../factories/money-transaction.factory'
import * as OrderFactory from '../factories/order.factory'
import * as PaymentApplicationFactory from '../factories/payment-application.factory'
import * as ProcurementFactory from '../factories/procurement.factory'
import * as UnitFactory from '../factories/unit.factory'
import * as WarehouseFactory from '../factories/warehouse.factory'

const TEST_USER_ID = '00000000-0000-4000-8000-000000000001'

describe('company balance', () => {
  afterEach(async () => {
    await BalanceFactory.removeAll()
    await PaymentApplicationFactory.removeAll()
    await MoneyTransactionFactory.removeAll()
    await OrderFactory.removeAll()
    await ProcurementFactory.removeAll()
    await StockLotModel.deleteMany({})
    await StockMoveModel.deleteMany({})
    await ProductModel.deleteMany({})
    await ClientModel.deleteMany({})
    await SupplierModel.deleteMany({})
    await CashregisterFactory.removeAll()
    await CashregisterAccountFactory.removeAll()
    await WarehouseFactory.removeAll()
    await CurrencyFactory.removeAll()
    await UnitFactory.removeAll()
  })

  it('computes net assets with detailed component breakdown', async () => {
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
    const account = parseResponse(createCashregisterAccountResponseSchema, await CashregisterAccountFactory.create({
      names: { en: 'Cash', ru: 'Касса' },
      priority: 1,
      currencyIds: [currency.data.id],
      active: true,
    }))
    const cashregister = parseResponse(createCashregisterResponseSchema, await CashregisterFactory.create({
      names: { en: 'Register', ru: 'Касса' },
      priority: 1,
      accountIds: [account.data.id],
      active: true,
    }))

    const product = await ProductModel.create({
      names: { en: 'Widget', ru: 'Виджет' },
      minorPrice: 20000,
      currencyId: currency.data.id,
      minorPurchasePrice: 1000,
      purchaseCurrencyId: currency.data.id,
      unitId: unit.data.id,
      categoryIds: [],
      images: [],
      productProperties: [],
      barcodeIds: [],
      quantityIds: [],
    })

    const sourceMoveId = uuidv4()
    await StockLotModel.create({
      productId: product._id,
      warehouseId: warehouse.data.id,
      originalCount: 5,
      remainingCount: 5,
      minorUnitCost: 1000,
      currencyId: currency.data.id,
      receivedAt: new Date(),
      sourceMoveId,
    })

    const transitDocumentId = uuidv4()
    await StockMoveModel.create({
      productId: product._id,
      fromKind: 'warehouse',
      toKind: 'transit',
      fromWarehouseId: warehouse.data.id,
      toWarehouseId: null,
      quantity: 2,
      openQuantity: 2,
      layers: [{
        lotId: uuidv4(),
        quantity: 2,
        minorUnitCost: 1000,
        currencyId: currency.data.id,
        receivedAt: new Date(),
      }],
      documentType: 'warehouse-transaction',
      documentId: transitDocumentId,
      documentItemId: null,
      userId: TEST_USER_ID,
      cancelled: false,
    })

    await MoneyTransactionModel.create({
      type: 'income',
      direction: 'in',
      accountId: account.data.id,
      cashregisterId: cashregister.data.id,
      minorAmount: 10000,
      currencyId: currency.data.id,
      sourceModel: 'manual',
      confirmed: true,
      createdBy: TEST_USER_ID,
    })

    const supplier = await SupplierModel.create({ name: 'Acme' })
    const prepaidProcurement = await ProcurementModel.create({
      supplierId: supplier._id,
      status: 'ordered',
      paymentStatus: 'paid',
      createdBy: TEST_USER_ID,
    })
    await ProcurementItemModel.create({
      procurementId: prepaidProcurement._id,
      productId: product._id,
      quantity: 3,
      receivedQuantity: 0,
      minorPurchasePrice: 1000,
      purchaseCurrencyId: currency.data.id,
    })
    const prepaidTx = await MoneyTransactionModel.create({
      type: 'procurement',
      direction: 'out',
      accountId: account.data.id,
      cashregisterId: cashregister.data.id,
      minorAmount: 3000,
      currencyId: currency.data.id,
      sourceModel: 'procurement',
      sourceId: prepaidProcurement._id,
      confirmed: true,
      createdBy: TEST_USER_ID,
    })
    await PaymentApplicationModel.create({
      partyType: 'supplier',
      partyId: supplier._id,
      documentType: 'procurement',
      documentId: prepaidProcurement._id,
      moneyTransactionId: prepaidTx._id,
      currencyId: currency.data.id,
      minorAmount: 3000,
      createdBy: TEST_USER_ID,
    })

    const unpaidOrdered = await ProcurementModel.create({
      supplierId: supplier._id,
      status: 'ordered',
      paymentStatus: 'unpaid',
      createdBy: TEST_USER_ID,
    })
    await ProcurementItemModel.create({
      procurementId: unpaidOrdered._id,
      productId: product._id,
      quantity: 2,
      receivedQuantity: 0,
      minorPurchasePrice: 1000,
      purchaseCurrencyId: currency.data.id,
    })

    const debtProcurement = await ProcurementModel.create({
      supplierId: supplier._id,
      status: 'received',
      paymentStatus: 'unpaid',
      createdBy: TEST_USER_ID,
    })
    await ProcurementItemModel.create({
      procurementId: debtProcurement._id,
      productId: product._id,
      quantity: 4,
      receivedQuantity: 4,
      minorPurchasePrice: 1000,
      purchaseCurrencyId: currency.data.id,
    })

    const client = await ClientModel.create({
      name: 'Jane',
      lastName: 'Doe',
    })
    const order = await OrderModel.create({
      warehouseId: warehouse.data.id,
      deliveryServiceId: uuidv4(),
      orderSourceId: uuidv4(),
      orderStatusId: uuidv4(),
      orderPaymentStatus: 'unpaid',
      clientId: client._id,
    })
    await OrderItemModel.create({
      orderId: order._id,
      productId: product._id,
      quantity: 1,
      minorBasePrice: 2500,
      minorPrice: 2500,
      minorPurchasePrice: 1000,
      purchaseCurrencyId: currency.data.id,
      currencyId: currency.data.id,
      minorProfit: 1500,
    })

    // cash 10000 - prepaid outflow 3000 = 7000 in register
    // warehouse 5*1000 = 5000
    // transit 2*1000 = 2000
    // ordered not received: prepaid proc 3000 + unpaid ordered 2000 = 5000
    // prepaid overpay: 0 (paid == ordered on prepaid proc)
    // receivable 2500
    // supplier debt: received unpaid 4000 + ordered unpaid unreceived 2000 = 6000
    // total = 7000 + 5000 + 2000 + 5000 + 2500 - 6000 = 15500

    const current = parseResponse(getCurrentBalanceResponseSchema, await BalanceFactory.getCurrent())
    expect(current.code).toBe('BALANCE_FETCHED')

    const cash = current.data.cashregisterBalance.find(row => row.cashregisterId === cashregister.data.id)
    expect(cash?.totals[0]?.minorAmount).toBe(7000)

    const stock = current.data.warehouseBalance.find(row => row.warehouseId === warehouse.data.id)
    expect(stock?.totals[0]?.minorAmount).toBe(5000)

    const transit = current.data.transitBalance.find(row => row.warehouseTransactionId === transitDocumentId)
    expect(transit?.totals[0]?.minorAmount).toBe(2000)

    const onOrderPrepaid = current.data.orderedNotReceivedBalance.find(row => row.procurementId === prepaidProcurement._id)
    expect(onOrderPrepaid?.totals[0]?.minorAmount).toBe(3000)

    const onOrderUnpaid = current.data.orderedNotReceivedBalance.find(row => row.procurementId === unpaidOrdered._id)
    expect(onOrderUnpaid?.totals[0]?.minorAmount).toBe(2000)

    expect(current.data.prepaidBalance.find(row => row.procurementId === prepaidProcurement._id)).toBeUndefined()

    const receivable = current.data.receivableBalance.find(row => row.orderId === order._id)
    expect(receivable?.totals[0]?.minorAmount).toBe(2500)

    const debtReceived = current.data.supplierDebtBalance.find(row => row.procurementId === debtProcurement._id)
    expect(debtReceived?.totals[0]?.minorAmount).toBe(4000)

    const debtOrdered = current.data.supplierDebtBalance.find(row => row.procurementId === unpaidOrdered._id)
    expect(debtOrdered?.totals[0]?.minorAmount).toBe(2000)

    const total = current.data.totalBalances.find(row => row.currencyId === currency.data.id)
    expect(total?.minorAmount).toBe(15500)
  })
})
