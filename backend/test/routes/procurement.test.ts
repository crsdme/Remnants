import type { CreateProcurementResponse } from '@remnant/shared'
import { parseResponse } from 'test/helpers/parse-response'
import {
  cancelProcurementPaymentResponseSchema,
  createCashregisterAccountResponseSchema,
  createCashregisterResponseSchema,
  createCurrencyResponseSchema,
  createProcurementResponseSchema,
  createUnitResponseSchema,
  editProcurementResponseSchema,
  getMoneyTransactionsResponseSchema,
  getPaymentApplicationsResponseSchema,
  getProcurementsResponseSchema,
  getSuppliersResponseSchema,
  payProcurementResponseSchema,
  paySupplierResponseSchema,
} from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import { ProductModel, SupplierModel } from '@/models'
import * as CashregisterAccountFactory from '../factories/cashregister-account.factory'
import * as CashregisterFactory from '../factories/cashregister.factory'
import * as CurrencyFactory from '../factories/currency.factory'
import * as MoneyTransactionFactory from '../factories/money-transaction.factory'
import * as PaymentApplicationFactory from '../factories/payment-application.factory'
import * as ProcurementFactory from '../factories/procurement.factory'
import * as SupplierFactory from '../factories/supplier.factory'
import * as UnitFactory from '../factories/unit.factory'

async function accountOutflow(accountId: string): Promise<number> {
  const payments = parseResponse(getMoneyTransactionsResponseSchema, await MoneyTransactionFactory.get({
    filters: { accountId },
    pagination: { full: true },
  }))
  return payments.data.items
    .filter(item => !item.cancelled)
    .reduce((sum, item) => sum + item.amount, 0)
}

async function seedPayables() {
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

  return { currency, unit, account, cashregister, supplier, product }
}

describe('procurement payments', () => {
  afterEach(async () => {
    await PaymentApplicationFactory.removeAll()
    await MoneyTransactionFactory.removeAll()
    await ProcurementFactory.removeAll()
    await ProductModel.deleteMany({})
    await SupplierModel.deleteMany({})
    await CashregisterFactory.removeAll()
    await CashregisterAccountFactory.removeAll()
    await CurrencyFactory.removeAll()
    await UnitFactory.removeAll()
  })

  it('pays a procurement and can cancel the payment', async () => {
    const { currency, account, cashregister, supplier, product } = await seedPayables()

    const created = parseResponse(createProcurementResponseSchema, await ProcurementFactory.create({
      supplierId: supplier._id,
      items: [{
        id: product._id,
        quantity: 2,
        purchasePrice: 100,
        purchaseCurrencyId: { id: currency.data.id },
      }],
    }))

    const paid = parseResponse(payProcurementResponseSchema, await ProcurementFactory.pay({
      procurementId: created.data.id,
      cashregister: cashregister.data.id,
      account: account.data.id,
      currency: currency.data.id,
      amount: 200,
    }))
    expect(paid.code).toBe('PROCUREMENT_PAID')
    expect(paid.data.paymentStatus).toBe('paid')
    expect(paid.data.balanceByCurrency[0]?.amount).toBe(0)

    const payments = parseResponse(getPaymentApplicationsResponseSchema, await PaymentApplicationFactory.get({
      filters: { documentType: 'procurement', documentId: created.data.id },
      pagination: { current: 1, pageSize: 10 },
    }))
    expect(payments.data.items).toHaveLength(1)
    expect(payments.data.items[0].cancelled).toBe(false)

    const cancelled = parseResponse(cancelProcurementPaymentResponseSchema, await ProcurementFactory.cancelPayment({
      applicationId: payments.data.items[0].id,
    }))
    expect(cancelled.code).toBe('PROCUREMENT_PAYMENT_CANCELLED')
    expect(cancelled.data.paymentStatus).toBe('unpaid')
    expect(cancelled.data.balanceByCurrency[0]?.amount).toBe(200)
    expect(await accountOutflow(account.data.id)).toBe(200)

    const advances = parseResponse(getMoneyTransactionsResponseSchema, await MoneyTransactionFactory.get({
      filters: { sourceModel: 'supplier', sourceId: supplier._id },
      pagination: { current: 1, pageSize: 10 },
    }))
    expect(advances.data.items.filter(item => !item.cancelled)).toHaveLength(1)

    const alreadyCancelled = await ProcurementFactory.cancelPayment({
      applicationId: payments.data.items[0].id,
    }) as { error?: { code?: string } }
    expect(alreadyCancelled.error?.code).toBe('PROCUREMENT_PAYMENT_CANCELLED')
  })

  it('allocates a supplier payment FIFO across procurements', async () => {
    const { currency, account, cashregister, supplier, product } = await seedPayables()

    const first = parseResponse(createProcurementResponseSchema, await ProcurementFactory.create({
      supplierId: supplier._id,
      items: [{
        id: product._id,
        quantity: 1,
        purchasePrice: 100,
        purchaseCurrencyId: { id: currency.data.id },
      }],
    }))
    const second = parseResponse(createProcurementResponseSchema, await ProcurementFactory.create({
      supplierId: supplier._id,
      items: [{
        id: product._id,
        quantity: 1,
        purchasePrice: 100,
        purchaseCurrencyId: { id: currency.data.id },
      }],
    }))

    const paid = parseResponse(paySupplierResponseSchema, await ProcurementFactory.paySupplier({
      supplierId: supplier._id,
      cashregister: cashregister.data.id,
      account: account.data.id,
      currency: currency.data.id,
      amount: 150,
    }))
    expect(paid.code).toBe('SUPPLIER_PAID')

    const beforeAllocate = parseResponse(getProcurementsResponseSchema, await ProcurementFactory.get({
      filters: { supplierId: supplier._id },
      pagination: { full: true },
    }))
    expect(beforeAllocate.data.items.every(item => item.paymentStatus === 'unpaid')).toBe(true)

    parseResponse(paySupplierResponseSchema, await ProcurementFactory.paySupplier({
      supplierId: supplier._id,
      currency: currency.data.id,
    }))

    const list = parseResponse(getProcurementsResponseSchema, await ProcurementFactory.get({
      filters: { supplierId: supplier._id },
      pagination: { full: true },
    }))
    const byId = new Map(list.data.items.map(item => [item.id, item]))
    expect(byId.get(first.data.id)?.paymentStatus).toBe('paid')
    expect(byId.get(first.data.id)?.balanceByCurrency[0]?.amount).toBe(0)
    expect(byId.get(second.data.id)?.paymentStatus).toBe('partially-paid')
    expect(byId.get(second.data.id)?.balanceByCurrency[0]?.amount).toBe(50)

    const suppliers = parseResponse(getSuppliersResponseSchema, await SupplierFactory.get({
      pagination: { current: 1, pageSize: 50 },
    }))
    const settlement = suppliers.data.items.find(item => item.id === supplier._id)
    expect(settlement?.debts[0]?.amount).toBe(50)
    expect(settlement?.payments[0]?.amount).toBe(150)
    expect(settlement?.balances).toEqual([])
  })

  it('keeps supplier overpayment as an advance instead of marking the procurement overpaid', async () => {
    const { currency, account, cashregister, supplier, product } = await seedPayables()

    const created = parseResponse(createProcurementResponseSchema, await ProcurementFactory.create({
      supplierId: supplier._id,
      items: [{
        id: product._id,
        quantity: 1,
        purchasePrice: 900,
        purchaseCurrencyId: { id: currency.data.id },
      }],
    }))

    parseResponse(paySupplierResponseSchema, await ProcurementFactory.paySupplier({
      supplierId: supplier._id,
      cashregister: cashregister.data.id,
      account: account.data.id,
      currency: currency.data.id,
      amount: 1000,
    }))
    parseResponse(paySupplierResponseSchema, await ProcurementFactory.paySupplier({
      supplierId: supplier._id,
      currency: currency.data.id,
    }))

    const list = parseResponse(getProcurementsResponseSchema, await ProcurementFactory.get({
      filters: { supplierId: supplier._id },
      pagination: { full: true },
    }))
    expect(list.data.items[0]?.id).toBe(created.data.id)
    expect(list.data.items[0]?.paymentStatus).toBe('paid')
    expect(list.data.items[0]?.balanceByCurrency[0]?.amount).toBe(0)

    const suppliers = parseResponse(getSuppliersResponseSchema, await SupplierFactory.get({
      pagination: { current: 1, pageSize: 50 },
    }))
    const settlement = suppliers.data.items.find(item => item.id === supplier._id)
    expect(settlement?.debts).toEqual([])
    expect(settlement?.payments[0]?.amount).toBe(1000)
    expect(settlement?.balances[0]?.amount).toBe(-100)
    expect(settlement?.seq).toBeGreaterThan(0)

    const supplierPayments = parseResponse(getMoneyTransactionsResponseSchema, await MoneyTransactionFactory.get({
      filters: { supplierId: supplier._id },
      pagination: { current: 1, pageSize: 50 },
    }))
    expect(supplierPayments.data.items).toHaveLength(1)

    const advances = parseResponse(getMoneyTransactionsResponseSchema, await MoneyTransactionFactory.get({
      filters: { sourceModel: 'supplier', sourceId: supplier._id },
      pagination: { current: 1, pageSize: 10 },
    }))
    expect(advances.data.items).toHaveLength(1)
    expect(advances.data.items[0]?.amount).toBe(1000)
  })

  it('releases excess payment as supplier credit when procurement total is reduced', async () => {
    const { currency, account, cashregister, supplier, product } = await seedPayables()

    const created = parseResponse(createProcurementResponseSchema, await ProcurementFactory.create({
      supplierId: supplier._id,
      items: [{
        id: product._id,
        quantity: 1,
        purchasePrice: 1000,
        purchaseCurrencyId: { id: currency.data.id },
      }],
    }))

    parseResponse(payProcurementResponseSchema, await ProcurementFactory.pay({
      procurementId: created.data.id,
      cashregister: cashregister.data.id,
      account: account.data.id,
      currency: currency.data.id,
      amount: 1000,
    }))

    const edited = parseResponse(editProcurementResponseSchema, await ProcurementFactory.edit({
      id: created.data.id,
      items: [{
        id: product._id,
        quantity: 1,
        purchasePrice: 950,
        purchaseCurrencyId: { id: currency.data.id },
      }],
    }))
    expect(edited.data.paymentStatus).toBe('paid')
    expect(edited.data.balanceByCurrency[0]?.amount).toBe(0)
    expect(edited.data.paymentsByCurrency[0]?.amount).toBe(950)

    const suppliers = parseResponse(getSuppliersResponseSchema, await SupplierFactory.get({
      pagination: { current: 1, pageSize: 50 },
    }))
    const settlement = suppliers.data.items.find(item => item.id === supplier._id)
    expect(settlement?.debts).toEqual([])
    expect(settlement?.payments[0]?.amount).toBe(1000)
    expect(settlement?.balances[0]?.amount).toBe(-50)
    expect(await accountOutflow(account.data.id)).toBe(1000)
  })

  it('accepts a supplier advance without procurements and applies it to the next one', async () => {
    const { currency, account, cashregister, supplier, product } = await seedPayables()

    parseResponse(paySupplierResponseSchema, await ProcurementFactory.paySupplier({
      supplierId: supplier._id,
      cashregister: cashregister.data.id,
      account: account.data.id,
      currency: currency.data.id,
      amount: 40,
    }))
    const cashAfterAdvance = await accountOutflow(account.data.id)

    const before = parseResponse(getSuppliersResponseSchema, await SupplierFactory.get({
      pagination: { current: 1, pageSize: 50 },
    }))
    const beforeRow = before.data.items.find(item => item.id === supplier._id)
    expect(beforeRow?.debts).toEqual([])
    expect(beforeRow?.payments[0]?.amount).toBe(40)
    expect(beforeRow?.balances[0]?.amount).toBe(-40)

    const created = parseResponse(createProcurementResponseSchema, await ProcurementFactory.create({
      supplierId: supplier._id,
      items: [{
        id: product._id,
        quantity: 1,
        purchasePrice: 100,
        purchaseCurrencyId: { id: currency.data.id },
      }],
    }))
    expect(created.data.paymentStatus).toBe('unpaid')
    expect(created.data.balanceByCurrency[0]?.amount).toBe(100)

    const afterCreate = parseResponse(getSuppliersResponseSchema, await SupplierFactory.get({
      pagination: { current: 1, pageSize: 50 },
    }))
    const afterCreateRow = afterCreate.data.items.find(item => item.id === supplier._id)
    expect(afterCreateRow?.debts[0]?.amount).toBe(100)
    expect(afterCreateRow?.payments[0]?.amount).toBe(40)
    expect(afterCreateRow?.balances[0]?.amount).toBe(-40)

    const paid = parseResponse(payProcurementResponseSchema, await ProcurementFactory.pay({
      procurementId: created.data.id,
      currency: currency.data.id,
    }))
    expect(paid.data.paymentStatus).toBe('partially-paid')
    expect(paid.data.balanceByCurrency[0]?.amount).toBe(60)
    expect(await accountOutflow(account.data.id)).toBe(cashAfterAdvance)

    const advances = parseResponse(getMoneyTransactionsResponseSchema, await MoneyTransactionFactory.get({
      filters: { sourceModel: 'supplier', sourceId: supplier._id },
      pagination: { current: 1, pageSize: 10 },
    }))
    expect(advances.data.items.filter(item => !item.cancelled)).toHaveLength(1)
    expect(advances.data.items.filter(item => !item.cancelled)[0]?.amount).toBe(40)
  })

  it('splits a larger supplier advance when paying a smaller procurement', async () => {
    const { currency, account, cashregister, supplier, product } = await seedPayables()

    parseResponse(paySupplierResponseSchema, await ProcurementFactory.paySupplier({
      supplierId: supplier._id,
      cashregister: cashregister.data.id,
      account: account.data.id,
      currency: currency.data.id,
      amount: 40,
    }))
    const cashAfterAdvance = await accountOutflow(account.data.id)

    const created = parseResponse(createProcurementResponseSchema, await ProcurementFactory.create({
      supplierId: supplier._id,
      items: [{
        id: product._id,
        quantity: 1,
        purchasePrice: 30,
        purchaseCurrencyId: { id: currency.data.id },
      }],
    }))
    expect(created.data.paymentStatus).toBe('unpaid')

    const paid = parseResponse(payProcurementResponseSchema, await ProcurementFactory.pay({
      procurementId: created.data.id,
      currency: currency.data.id,
    }))
    expect(paid.data.paymentStatus).toBe('paid')
    expect(paid.data.balanceByCurrency[0]?.amount).toBe(0)
    expect(await accountOutflow(account.data.id)).toBe(cashAfterAdvance)

    const all = parseResponse(getMoneyTransactionsResponseSchema, await MoneyTransactionFactory.get({
      filters: { supplierId: supplier._id },
      pagination: { current: 1, pageSize: 20 },
    }))
    expect(all.data.items.filter(item => item.cancelled)).toHaveLength(0)

    const advances = parseResponse(getMoneyTransactionsResponseSchema, await MoneyTransactionFactory.get({
      filters: { sourceModel: 'supplier', sourceId: supplier._id },
      pagination: { current: 1, pageSize: 20 },
    }))
    const activeAdvances = advances.data.items.filter(item => !item.cancelled)
    expect(activeAdvances).toHaveLength(1)
    expect(activeAdvances[0]?.amount).toBe(40)

    const procurementPayments = parseResponse(getPaymentApplicationsResponseSchema, await PaymentApplicationFactory.get({
      filters: { documentType: 'procurement', documentId: created.data.id },
      pagination: { current: 1, pageSize: 20 },
    }))
    expect(procurementPayments.data.items.filter(item => !item.cancelled)).toHaveLength(1)
    expect(procurementPayments.data.items.find(item => !item.cancelled)?.amount).toBe(30)

    const leftover = parseResponse(getSuppliersResponseSchema, await SupplierFactory.get({
      pagination: { current: 1, pageSize: 50 },
    }))
    expect(leftover.data.items.find(item => item.id === supplier._id)?.balances[0]?.amount).toBe(-10)
  })

  it('applies leftover credit of 100 to a new procurement of 100 without cash', async () => {
    const { currency, account, cashregister, supplier, product } = await seedPayables()

    parseResponse(paySupplierResponseSchema, await ProcurementFactory.paySupplier({
      supplierId: supplier._id,
      cashregister: cashregister.data.id,
      account: account.data.id,
      currency: currency.data.id,
      amount: 100,
    }))
    const cashAfterAdvance = await accountOutflow(account.data.id)

    const created = parseResponse(createProcurementResponseSchema, await ProcurementFactory.create({
      supplierId: supplier._id,
      items: [{
        id: product._id,
        quantity: 1,
        purchasePrice: 100,
        purchaseCurrencyId: { id: currency.data.id },
      }],
    }))
    expect(created.data.paymentStatus).toBe('unpaid')

    const paid = parseResponse(payProcurementResponseSchema, await ProcurementFactory.pay({
      procurementId: created.data.id,
      currency: currency.data.id,
    }))
    expect(paid.data.paymentStatus).toBe('paid')
    expect(paid.data.balanceByCurrency[0]?.amount).toBe(0)
    expect(await accountOutflow(account.data.id)).toBe(cashAfterAdvance)
  })

  it('pays 400 cash FIFO across five procurements of 100', async () => {
    const { currency, account, cashregister, supplier, product } = await seedPayables()

    const created: CreateProcurementResponse[] = []
    for (let index = 0; index < 5; index += 1) {
      created.push(parseResponse(createProcurementResponseSchema, await ProcurementFactory.create({
        supplierId: supplier._id,
        items: [{
          id: product._id,
          quantity: 1,
          purchasePrice: 100,
          purchaseCurrencyId: { id: currency.data.id },
        }],
      })))
    }

    parseResponse(paySupplierResponseSchema, await ProcurementFactory.paySupplier({
      supplierId: supplier._id,
      cashregister: cashregister.data.id,
      account: account.data.id,
      currency: currency.data.id,
      amount: 400,
    }))
    parseResponse(paySupplierResponseSchema, await ProcurementFactory.paySupplier({
      supplierId: supplier._id,
      currency: currency.data.id,
    }))

    const list = parseResponse(getProcurementsResponseSchema, await ProcurementFactory.get({
      filters: { supplierId: supplier._id },
      pagination: { full: true },
    }))
    const byId = new Map(list.data.items.map(item => [item.id, item]))
    expect(byId.get(created[0].data.id)?.paymentStatus).toBe('paid')
    expect(byId.get(created[1].data.id)?.paymentStatus).toBe('paid')
    expect(byId.get(created[2].data.id)?.paymentStatus).toBe('paid')
    expect(byId.get(created[3].data.id)?.paymentStatus).toBe('paid')
    expect(byId.get(created[4].data.id)?.paymentStatus).toBe('unpaid')

    const procurementPayments = parseResponse(getPaymentApplicationsResponseSchema, await PaymentApplicationFactory.get({
      filters: { partyId: supplier._id, documentType: 'procurement' },
      pagination: { full: true },
    }))
    expect(procurementPayments.data.items.filter(item => !item.cancelled)).toHaveLength(4)
    expect(await accountOutflow(account.data.id)).toBe(400)
  })

  it('applies existing credit then new cash when paying a supplier', async () => {
    const { currency, account, cashregister, supplier, product } = await seedPayables()

    parseResponse(paySupplierResponseSchema, await ProcurementFactory.paySupplier({
      supplierId: supplier._id,
      cashregister: cashregister.data.id,
      account: account.data.id,
      currency: currency.data.id,
      amount: 100,
    }))

    for (let index = 0; index < 5; index += 1) {
      parseResponse(createProcurementResponseSchema, await ProcurementFactory.create({
        supplierId: supplier._id,
        items: [{
          id: product._id,
          quantity: 1,
          purchasePrice: 100,
          purchaseCurrencyId: { id: currency.data.id },
        }],
      }))
    }

    parseResponse(paySupplierResponseSchema, await ProcurementFactory.paySupplier({
      supplierId: supplier._id,
      cashregister: cashregister.data.id,
      account: account.data.id,
      currency: currency.data.id,
      amount: 300,
    }))
    parseResponse(paySupplierResponseSchema, await ProcurementFactory.paySupplier({
      supplierId: supplier._id,
      currency: currency.data.id,
    }))

    const list = parseResponse(getProcurementsResponseSchema, await ProcurementFactory.get({
      filters: { supplierId: supplier._id },
      pagination: { full: true },
    }))
    expect(list.data.items.filter(item => item.paymentStatus === 'paid')).toHaveLength(4)
    expect(list.data.items.filter(item => item.paymentStatus === 'unpaid')).toHaveLength(1)
    expect(await accountOutflow(account.data.id)).toBe(400)
  })

  it('returns a cancelled supplier-payment slice to advance without restoring cash', async () => {
    const { currency, account, cashregister, supplier, product } = await seedPayables()

    const first = parseResponse(createProcurementResponseSchema, await ProcurementFactory.create({
      supplierId: supplier._id,
      items: [{
        id: product._id,
        quantity: 1,
        purchasePrice: 100,
        purchaseCurrencyId: { id: currency.data.id },
      }],
    }))
    const second = parseResponse(createProcurementResponseSchema, await ProcurementFactory.create({
      supplierId: supplier._id,
      items: [{
        id: product._id,
        quantity: 1,
        purchasePrice: 100,
        purchaseCurrencyId: { id: currency.data.id },
      }],
    }))

    parseResponse(paySupplierResponseSchema, await ProcurementFactory.paySupplier({
      supplierId: supplier._id,
      cashregister: cashregister.data.id,
      account: account.data.id,
      currency: currency.data.id,
      amount: 200,
    }))
    parseResponse(paySupplierResponseSchema, await ProcurementFactory.paySupplier({
      supplierId: supplier._id,
      currency: currency.data.id,
    }))
    expect(await accountOutflow(account.data.id)).toBe(200)

    const firstPayments = parseResponse(getPaymentApplicationsResponseSchema, await PaymentApplicationFactory.get({
      filters: { documentType: 'procurement', documentId: first.data.id },
      pagination: { current: 1, pageSize: 10 },
    }))
    parseResponse(cancelProcurementPaymentResponseSchema, await ProcurementFactory.cancelPayment({
      applicationId: firstPayments.data.items[0].id,
    }))

    const list = parseResponse(getProcurementsResponseSchema, await ProcurementFactory.get({
      filters: { supplierId: supplier._id },
      pagination: { full: true },
    }))
    const byId = new Map(list.data.items.map(item => [item.id, item]))
    expect(byId.get(first.data.id)?.paymentStatus).toBe('unpaid')
    expect(byId.get(second.data.id)?.paymentStatus).toBe('paid')
    expect(await accountOutflow(account.data.id)).toBe(200)

    const suppliers = parseResponse(getSuppliersResponseSchema, await SupplierFactory.get({
      pagination: { current: 1, pageSize: 50 },
    }))
    expect(suppliers.data.items.find(item => item.id === supplier._id)?.balances[0]?.amount).toBe(-100)

    const advances = parseResponse(getMoneyTransactionsResponseSchema, await MoneyTransactionFactory.get({
      filters: { sourceModel: 'supplier', sourceId: supplier._id },
      pagination: { current: 1, pageSize: 10 },
    }))
    expect(advances.data.items.filter(item => !item.cancelled)[0]?.amount).toBe(200)
  })
})
