import { parseResponse } from 'test/helpers/parse-response'
import {
  createCashregisterAccountResponseSchema,
  createCashregisterResponseSchema,
  createClientResponseSchema,
  createCurrencyResponseSchema,
  getClientsResponseSchema,
  getMoneyTransactionsResponseSchema,
  getPaymentApplicationsResponseSchema,
  payClientResponseSchema,
  payOrderResponseSchema,
} from '@remnant/shared'
import { v4 as uuidv4 } from 'uuid'
import { afterEach, describe, expect, it } from 'vitest'
import { OrderItemModel, OrderModel } from '@/models'
import * as PaymentApplicationRepo from '@/repositories/payment-application.repo'
import * as Settlement from '@/services/settlement.service'
import * as CashregisterAccountFactory from '../factories/cashregister-account.factory'
import * as CashregisterFactory from '../factories/cashregister.factory'
import * as ClientFactory from '../factories/client.factory'
import * as CurrencyFactory from '../factories/currency.factory'
import * as MoneyTransactionFactory from '../factories/money-transaction.factory'
import * as OrderFactory from '../factories/order.factory'
import * as PaymentApplicationFactory from '../factories/payment-application.factory'

const TEST_USER_ID = '00000000-0000-4000-8000-000000000001'

async function seedCash() {
  const currency = parseResponse(createCurrencyResponseSchema, await CurrencyFactory.create({
    names: { en: 'Hryvnia', ru: 'Гривна' },
    symbols: { en: 'UAH', ru: 'грн' },
    scale: 2,
    paymentEpsilon: 0.01,
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
  const client = parseResponse(createClientResponseSchema, await ClientFactory.create({
    name: 'Jane',
    lastName: 'Doe',
  }))

  return { currency, account, cashregister, client }
}

async function createOpenOrder(clientId: string, currencyId: string, minorPrice = 10000) {
  const [order] = await OrderModel.create([{
    warehouseId: uuidv4(),
    deliveryServiceId: uuidv4(),
    orderSourceId: uuidv4(),
    orderStatusId: uuidv4(),
    orderPaymentStatus: 'unpaid',
    clientId,
  }])
  await OrderItemModel.create({
    orderId: order._id,
    productId: uuidv4(),
    quantity: 1,
    minorBasePrice: minorPrice,
    minorPrice,
    minorPurchasePrice: minorPrice,
    purchaseCurrencyId: currencyId,
    currencyId,
    minorProfit: 0,
  })
  return order
}

async function clientRow(clientId: string) {
  const list = parseResponse(getClientsResponseSchema, await ClientFactory.get({
    pagination: { current: 1, pageSize: 50 },
  }))
  const row = list.data.items.find(item => item.id === clientId)
  expect(row).toBeDefined()
  return row!
}

describe('client settlement', () => {
  afterEach(async () => {
    await PaymentApplicationFactory.removeAll()
    await MoneyTransactionFactory.removeAll()
    await OrderFactory.removeAll()
    await ClientFactory.removeAll()
    await CashregisterFactory.removeAll()
    await CashregisterAccountFactory.removeAll()
    await CurrencyFactory.removeAll()
  })

  it('posts cash on the client and allocates it to the order', async () => {
    const { currency, account, cashregister, client } = await seedCash()
    const order = await createOpenOrder(client.data.id, currency.data.id)

    const unpaid = await clientRow(client.data.id)
    expect(unpaid.debts[0]?.amount).toBe(100)
    expect(unpaid.payments).toEqual([])
    expect(unpaid.balances).toEqual([])

    const paid = parseResponse(payOrderResponseSchema, await OrderFactory.pay({
      id: order._id,
      cashregister: cashregister.data.id,
      account: account.data.id,
      currency: currency.data.id,
      amount: 100,
    }))
    expect(paid.code).toBe('ORDER_PAYED')

    const cash = parseResponse(getMoneyTransactionsResponseSchema, await MoneyTransactionFactory.get({
      filters: { sourceModel: 'client', sourceId: client.data.id },
      pagination: { current: 1, pageSize: 10 },
    }))
    const live = cash.data.items.filter(item => !item.cancelled)
    expect(live).toHaveLength(1)
    expect(live[0].sourceModel).toBe('client')
    expect(live[0].amount).toBe(100)

    const apps = parseResponse(getPaymentApplicationsResponseSchema, await PaymentApplicationFactory.get({
      filters: { documentType: 'order', documentId: order._id },
      pagination: { current: 1, pageSize: 10 },
    }))
    expect(apps.data.items).toHaveLength(1)
    expect(apps.data.items[0].cancelled).toBe(false)
    expect(apps.data.items[0].seq).toBeGreaterThan(0)
    expect(apps.data.items[0].partyType).toBe('client')
    expect(apps.data.items[0].amount).toBe(100)

    const settled = await clientRow(client.data.id)
    expect(settled.debts).toEqual([])
    expect(settled.payments[0]?.amount).toBe(100)
    expect(settled.balances).toEqual([])
    expect((await OrderModel.findById(order._id))?.orderPaymentStatus).toBe('paid')
  })

  it('keeps client cash when an application is cancelled', async () => {
    const { currency, account, cashregister, client } = await seedCash()
    const order = await createOpenOrder(client.data.id, currency.data.id)

    parseResponse(payOrderResponseSchema, await OrderFactory.pay({
      id: order._id,
      cashregister: cashregister.data.id,
      account: account.data.id,
      currency: currency.data.id,
      amount: 100,
    }))

    const apps = parseResponse(getPaymentApplicationsResponseSchema, await PaymentApplicationFactory.get({
      filters: { documentType: 'order', documentId: order._id },
      pagination: { current: 1, pageSize: 10 },
    }))
    await PaymentApplicationRepo.cancelById({
      id: apps.data.items[0].id,
      cancelledBy: TEST_USER_ID,
    })
    await Settlement.refreshOrderPaymentStatus(order._id)

    const cash = parseResponse(getMoneyTransactionsResponseSchema, await MoneyTransactionFactory.get({
      filters: { sourceModel: 'client', sourceId: client.data.id },
      pagination: { current: 1, pageSize: 10 },
    }))
    expect(cash.data.items.filter(item => !item.cancelled)).toHaveLength(1)
    expect(cash.data.items[0].amount).toBe(100)

    const after = await clientRow(client.data.id)
    expect(after.debts[0]?.amount).toBe(100)
    expect(after.payments[0]?.amount).toBe(100)
    expect(after.balances[0]?.amount).toBe(-100)
  })

  it('records a client deposit as credit and FIFO-allocates it across orders', async () => {
    const { currency, account, cashregister, client } = await seedCash()
    const first = await createOpenOrder(client.data.id, currency.data.id)
    const second = await createOpenOrder(client.data.id, currency.data.id)

    const deposited = parseResponse(payClientResponseSchema, await ClientFactory.pay({
      clientId: client.data.id,
      cashregister: cashregister.data.id,
      account: account.data.id,
      currency: currency.data.id,
      amount: 150,
    }))
    expect(deposited.code).toBe('CLIENT_PAID')
    expect(deposited.data.debts[0]?.amount).toBe(200)
    expect(deposited.data.payments[0]?.amount).toBe(150)
    expect(deposited.data.balances[0]?.amount).toBe(-150)

    parseResponse(payClientResponseSchema, await ClientFactory.pay({
      clientId: client.data.id,
      currency: currency.data.id,
    }))

    const firstApps = parseResponse(getPaymentApplicationsResponseSchema, await PaymentApplicationFactory.get({
      filters: { documentType: 'order', documentId: first._id },
      pagination: { current: 1, pageSize: 10 },
    }))
    const secondApps = parseResponse(getPaymentApplicationsResponseSchema, await PaymentApplicationFactory.get({
      filters: { documentType: 'order', documentId: second._id },
      pagination: { current: 1, pageSize: 10 },
    }))
    expect(firstApps.data.items.filter(item => !item.cancelled)).toHaveLength(1)
    expect(secondApps.data.items.filter(item => !item.cancelled)).toHaveLength(1)
    expect((await OrderModel.findById(first._id))?.orderPaymentStatus).toBe('paid')
    expect((await OrderModel.findById(second._id))?.orderPaymentStatus).toBe('partially_paid')

    const settled = await clientRow(client.data.id)
    expect(settled.debts[0]?.amount).toBe(50)
    expect(settled.payments[0]?.amount).toBe(150)
    expect(settled.balances).toEqual([])
  })

  it('allocates existing client credit to an order without posting cash', async () => {
    const { currency, account, cashregister, client } = await seedCash()
    const order = await createOpenOrder(client.data.id, currency.data.id)

    parseResponse(payClientResponseSchema, await ClientFactory.pay({
      clientId: client.data.id,
      cashregister: cashregister.data.id,
      account: account.data.id,
      currency: currency.data.id,
      amount: 100,
    }))

    parseResponse(payOrderResponseSchema, await OrderFactory.pay({
      id: order._id,
      currency: currency.data.id,
    }))

    const cash = parseResponse(getMoneyTransactionsResponseSchema, await MoneyTransactionFactory.get({
      filters: { sourceModel: 'client', sourceId: client.data.id },
      pagination: { current: 1, pageSize: 10 },
    }))
    expect(cash.data.items.filter(item => !item.cancelled)).toHaveLength(1)

    const apps = parseResponse(getPaymentApplicationsResponseSchema, await PaymentApplicationFactory.get({
      filters: { documentType: 'order', documentId: order._id },
      pagination: { current: 1, pageSize: 10 },
    }))
    expect(apps.data.items.filter(item => !item.cancelled)).toHaveLength(1)

    const settled = await clientRow(client.data.id)
    expect(settled.debts).toEqual([])
    expect(settled.payments[0]?.amount).toBe(100)
    expect(settled.balances).toEqual([])
  })

  it('requires a client before taking payment', async () => {
    const { currency, account, cashregister } = await seedCash()
    const [order] = await OrderModel.create([{
      warehouseId: uuidv4(),
      deliveryServiceId: uuidv4(),
      orderSourceId: uuidv4(),
      orderStatusId: uuidv4(),
      orderPaymentStatus: 'unpaid',
    }])

    const response = await OrderFactory.pay({
      id: order._id,
      cashregister: cashregister.data.id,
      account: account.data.id,
      currency: currency.data.id,
      amount: 100,
    }) as { error?: { code?: string } }
    expect(response.error?.code).toBe('CLIENT_REQUIRED')
  })
})
