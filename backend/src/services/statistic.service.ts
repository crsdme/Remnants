import type {
  AuthUser,
  GetOrderStatisticPayload,
  GetStatisticResponse,
  LanguageString,
  OrderDTOPopulated,
  OrderItemDTOPopulated,
  OrderPaymentDTOPopulated,
  StatisticMoneyDTO,
  StatisticsDTO,
} from '@remnant/shared'
import { toMinorType } from '@remnant/shared'
import * as ExpenseService from '@/services/expense.service'
import * as OrderPaymentService from '@/services/order-payment.service'
import * as OrderService from '@/services/order.service'
import * as OrderStatusService from '@/services/order-status.service'
import * as UserService from '@/services/user.service'
import {
  parseGetExpenses,
  parseGetOrderItems,
  parseGetOrderPayments,
  parseGetOrderStatuses,
  parseGetOrders,
} from '@/types'
import { fromMinor, toMinor } from '@/utils/money'

type CurrencySnippet = StatisticMoneyDTO['currency']

interface MoneyBucket {
  currency: CurrencySnippet
  minor: number
}

type MoneyMap = Record<string, MoneyBucket>

function toCurrencySnippet(currency: {
  id: string
  names: LanguageString
  symbols: LanguageString
  scale: number
}): CurrencySnippet {
  return {
    id: currency.id,
    names: currency.names,
    symbols: currency.symbols,
    scale: currency.scale,
  }
}

function addMajor(map: MoneyMap, currency: CurrencySnippet, majorAmount: number) {
  if (!currency?.id || !Number.isFinite(majorAmount) || majorAmount === 0)
    return

  const minorDelta = toMinor(majorAmount, currency.scale)
  const existing = map[currency.id]
  if (!existing) {
    map[currency.id] = { currency: toCurrencySnippet(currency), minor: minorDelta }
    return
  }
  existing.minor += minorDelta
}

function mapToMoneyArray(map: MoneyMap): StatisticMoneyDTO[] {
  return Object.values(map)
    .filter(row => row.minor !== 0)
    .map(row => ({
      currency: row.currency,
      total: Number.parseFloat(fromMinor(toMinorType(row.minor), row.currency.scale)),
    }))
    .sort((a, b) => a.currency.id.localeCompare(b.currency.id))
}

function diffMoneyMaps(income: MoneyMap, expense: MoneyMap): MoneyMap {
  const result: MoneyMap = {}
  for (const [id, row] of Object.entries(income)) {
    result[id] = { currency: row.currency, minor: row.minor }
  }
  for (const [id, row] of Object.entries(expense)) {
    if (!result[id]) {
      result[id] = { currency: row.currency, minor: -row.minor }
    }
    else {
      result[id].minor -= row.minor
    }
  }
  return result
}

function dayKey(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function eachDayKeys(from?: Date, to?: Date): string[] {
  if (!from || !to)
    return []

  const keys: string[] = []
  const cursor = new Date(from)
  cursor.setHours(0, 0, 0, 0)
  const end = new Date(to)
  end.setHours(0, 0, 0, 0)

  // Cap series length to avoid huge responses
  const maxDays = 366
  let guard = 0
  while (cursor <= end && guard < maxDays) {
    keys.push(dayKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
    guard += 1
  }
  return keys
}

function matchesCashFilters(
  payment: { cashregister?: { id: string }, cashregisterAccount?: { id: string } },
  cashregisterIds: string[],
  cashregisterAccountIds: string[],
) {
  if (cashregisterIds.length > 0 && !cashregisterIds.includes(payment.cashregister?.id ?? ''))
    return false
  if (cashregisterAccountIds.length > 0 && !cashregisterAccountIds.includes(payment.cashregisterAccount?.id ?? ''))
    return false
  return true
}

function isPaidStatus(status: OrderDTOPopulated['orderPaymentStatus']) {
  return status === 'paid' || status === 'overpaid'
}

function isCountedInStatistics(includeInStatistics: boolean | undefined) {
  return includeInStatistics !== false
}

export async function get({
  payload,
  user,
}: {
  payload: GetOrderStatisticPayload
  user: AuthUser
}): Promise<GetStatisticResponse> {
  const { date, cashregister = [], cashregisterAccount = [] } = payload.filters || {}
  const hasProfitPermission = await UserService.checkPermission('order.profit', user.id)

  const [
    { data: { items: statuses } },
    { data: { items: ordersRaw } },
    { data: { items: paymentsByDateRaw } },
    { data: { items: expensesRaw } },
  ] = await Promise.all([
    OrderStatusService.get({
      payload: parseGetOrderStatuses({ pagination: { full: true } }),
      user,
    }),
    OrderService.get({
      payload: parseGetOrders({ filters: { createdAt: date, removed: false }, pagination: { full: true } }),
      user,
    }),
    OrderPaymentService.get({
      payload: parseGetOrderPayments({ filters: { paymentDate: date }, pagination: { full: true } }),
    }),
    ExpenseService.get({
      payload: parseGetExpenses({ filters: { createdAt: date }, pagination: { full: true } }),
      user,
    }),
  ])

  const countedStatusIds = new Set(
    statuses
      .filter(status => isCountedInStatistics(status.includeInStatistics))
      .map(status => status.id),
  )

  const orders = ordersRaw.filter(order => countedStatusIds.has(order.orderStatus.id))
  const orderIds = orders.map(order => order.id)
  const orderById = new Map(orders.map(order => [order.id, order]))

  // Status lookup for payments whose order is outside the createdAt range
  const orderStatusByOrderId = new Map(
    ordersRaw.map(order => [order.id, order.orderStatus.id]),
  )

  const paymentOrderIds = [...new Set(
    paymentsByDateRaw
      .map(payment => payment.order)
      .filter((orderId): orderId is string => Boolean(orderId)),
  )]
  const missingPaymentOrderIds = paymentOrderIds.filter(id => !orderStatusByOrderId.has(id))

  let orderItems: OrderItemDTOPopulated[] = []
  let paymentsForOrders: OrderPaymentDTOPopulated[] = []

  const [itemsAndPayments, extraPaymentOrdersResult] = await Promise.all([
    orderIds.length > 0
      ? Promise.all([
          OrderService.getItems({
            payload: parseGetOrderItems({ filters: { order: orderIds }, pagination: { full: true } }),
            user,
          }),
          OrderPaymentService.get({
            payload: parseGetOrderPayments({ filters: { order: orderIds }, pagination: { full: true } }),
          }),
        ])
      : Promise.resolve(null),
    missingPaymentOrderIds.length > 0
      ? OrderService.get({
          payload: parseGetOrders({
            filters: { ids: missingPaymentOrderIds, removed: false },
            pagination: { full: true },
          }),
          user,
        })
      : Promise.resolve(null),
  ])

  if (itemsAndPayments) {
    orderItems = itemsAndPayments[0].data.items
    paymentsForOrders = itemsAndPayments[1].data.items
  }

  if (extraPaymentOrdersResult) {
    for (const order of extraPaymentOrdersResult.data.items)
      orderStatusByOrderId.set(order.id, order.orderStatus.id)
  }

  const paymentsByDate = paymentsByDateRaw.filter((payment) => {
    const statusId = orderStatusByOrderId.get(payment.order)
    if (!statusId || !countedStatusIds.has(statusId))
      return false
    return matchesCashFilters(payment, cashregister, cashregisterAccount)
  })

  const expenses = expensesRaw.filter(e =>
    matchesCashFilters(e, cashregister, cashregisterAccount),
  )

  const turnoverMap: MoneyMap = {}
  const paidAmountMap: MoneyMap = {}
  const unpaidAmountMap: MoneyMap = {}
  const incomeMap: MoneyMap = {}
  const expenseMap: MoneyMap = {}
  const marginMap: MoneyMap = {}

  for (const item of orderItems) {
    const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0)
    addMajor(turnoverMap, item.currency, lineTotal)
    if (hasProfitPermission && item.profit != null) {
      addMajor(marginMap, item.currency, (Number(item.profit) || 0) * (Number(item.quantity) || 0))
    }
  }

  // Paid / unpaid amounts per order × currency (from items vs payments)
  const orderItemTotals: Record<string, MoneyMap> = {}
  for (const item of orderItems) {
    const orderId = typeof item.order === 'string' ? item.order : String(item.order)
    orderItemTotals[orderId] ||= {}
    const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0)
    addMajor(orderItemTotals[orderId], item.currency, lineTotal)
  }

  const orderPaidMap: Record<string, MoneyMap> = {}
  for (const payment of paymentsForOrders) {
    const orderId = payment.order
    if (!orderId)
      continue
    orderPaidMap[orderId] ||= {}
    addMajor(orderPaidMap[orderId], payment.currency, Number(payment.amount) || 0)
  }

  let paidCount = 0
  let unpaidCount = 0

  for (const order of orders) {
    if (isPaidStatus(order.orderPaymentStatus))
      paidCount += 1
    else
      unpaidCount += 1

    const totals = orderItemTotals[order.id] || {}
    const paid = orderPaidMap[order.id] || {}
    const currencyIds = new Set([...Object.keys(totals), ...Object.keys(paid)])

    for (const currencyId of currencyIds) {
      const due = totals[currencyId]?.minor ?? 0
      const got = paid[currencyId]?.minor ?? 0
      const currency = totals[currencyId]?.currency ?? paid[currencyId]?.currency
      if (!currency)
        continue

      const paidPart = Math.min(got, due)
      const remain = Math.max(0, due - got)

      if (paidPart !== 0) {
        paidAmountMap[currencyId] ||= { currency, minor: 0 }
        paidAmountMap[currencyId].minor += paidPart
      }
      if (remain !== 0) {
        unpaidAmountMap[currencyId] ||= { currency, minor: 0 }
        unpaidAmountMap[currencyId].minor += remain
      }
    }
  }

  for (const payment of paymentsByDate) {
    addMajor(incomeMap, payment.currency, Number(payment.amount) || 0)
  }

  const expenseCategories: Record<string, {
    category: { id: string, names: LanguageString }
    count: number
    currencies: MoneyMap
  }> = {}

  for (const expense of expenses) {
    addMajor(expenseMap, expense.currency, Number(expense.amount) || 0)

    for (const category of expense.categories) {
      const categoryId = category.id
      if (!expenseCategories[categoryId]) {
        expenseCategories[categoryId] = {
          category: { id: category.id, names: category.names },
          count: 0,
          currencies: {},
        }
      }
      expenseCategories[categoryId].count += 1
      addMajor(expenseCategories[categoryId].currencies, expense.currency, Number(expense.amount) || 0)
    }
  }

  const cashProfitMap = diffMoneyMaps(incomeMap, expenseMap)

  // Products aggregation
  const productsMap: Record<string, {
    product: { id: string, names: LanguageString }
    quantity: number
    amount: MoneyMap
    profit: MoneyMap
  }> = {}

  for (const item of orderItems) {
    const productId = item.product.id
    if (!productsMap[productId]) {
      productsMap[productId] = {
        product: { id: item.product.id, names: item.product.names },
        quantity: 0,
        amount: {},
        profit: {},
      }
    }
    productsMap[productId].quantity += Number(item.quantity) || 0
    addMajor(
      productsMap[productId].amount,
      item.currency,
      (Number(item.price) || 0) * (Number(item.quantity) || 0),
    )
    if (hasProfitPermission && item.profit != null) {
      addMajor(
        productsMap[productId].profit,
        item.currency,
        (Number(item.profit) || 0) * (Number(item.quantity) || 0),
      )
    }
  }

  const productItems = Object.values(productsMap)
    .map((row) => {
      const entry: StatisticsDTO['products']['items'][number] = {
        product: row.product,
        quantity: row.quantity,
        amount: mapToMoneyArray(row.amount),
      }
      if (hasProfitPermission)
        entry.profit = mapToMoneyArray(row.profit)
      return entry
    })
    .sort((a, b) => {
      const aTotal = a.amount.reduce((s, m) => s + Math.abs(m.total), 0)
      const bTotal = b.amount.reduce((s, m) => s + Math.abs(m.total), 0)
      return bTotal - aTotal
    })

  // Daily series
  const dayKeys = eachDayKeys(date?.from, date?.to)
  const seriesMaps: Record<string, {
    turnover: MoneyMap
    income: MoneyMap
    expenses: MoneyMap
  }> = {}

  for (const key of dayKeys) {
    seriesMaps[key] = { turnover: {}, income: {}, expenses: {} }
  }

  // Assign item turnover to order created day
  for (const item of orderItems) {
    const orderId = typeof item.order === 'string' ? item.order : String(item.order)
    const order = orderById.get(orderId)
    if (!order?.createdAt)
      continue
    const key = dayKey(order.createdAt)
    if (!seriesMaps[key])
      continue
    addMajor(
      seriesMaps[key].turnover,
      item.currency,
      (Number(item.price) || 0) * (Number(item.quantity) || 0),
    )
  }

  for (const payment of paymentsByDate) {
    const key = dayKey(payment.paymentDate)
    if (!seriesMaps[key])
      continue
    addMajor(seriesMaps[key].income, payment.currency, Number(payment.amount) || 0)
  }

  for (const expense of expenses) {
    const key = dayKey(expense.createdAt)
    if (!seriesMaps[key])
      continue
    addMajor(seriesMaps[key].expenses, expense.currency, Number(expense.amount) || 0)
  }

  const series: StatisticsDTO['series'] = dayKeys.map((key) => {
    const day = seriesMaps[key]
    const profit = diffMoneyMaps(day.income, day.expenses)
    return {
      date: key,
      turnover: mapToMoneyArray(day.turnover),
      income: mapToMoneyArray(day.income),
      expenses: mapToMoneyArray(day.expenses),
      profit: mapToMoneyArray(profit),
    }
  })

  const statistics: StatisticsDTO = {
    range: date ?? {},
    orders: {
      count: orders.length,
      amount: mapToMoneyArray(turnoverMap),
      paid: {
        count: paidCount,
        amount: mapToMoneyArray(paidAmountMap),
      },
      unpaid: {
        count: unpaidCount,
        amount: mapToMoneyArray(unpaidAmountMap),
      },
    },
    payments: {
      count: paymentsByDate.length,
      amount: mapToMoneyArray(incomeMap),
      income: {
        count: paymentsByDate.length,
        amount: mapToMoneyArray(incomeMap),
      },
      expense: {
        count: expenses.length,
        amount: mapToMoneyArray(expenseMap),
        categories: Object.values(expenseCategories).map(cat => ({
          category: cat.category,
          count: cat.count,
          currencies: mapToMoneyArray(cat.currencies),
        })),
      },
      profit: {
        count: paymentsByDate.length + expenses.length,
        amount: mapToMoneyArray(cashProfitMap),
      },
      ...(hasProfitPermission
        ? {
            margin: {
              count: orderItems.length,
              amount: mapToMoneyArray(marginMap),
            },
          }
        : {}),
    },
    products: {
      count: productItems.length,
      items: productItems,
    },
    series,
  }

  return {
    status: 'success',
    code: 'STATISTICS_FETCHED',
    message: 'Statistics fetched',
    data: statistics,
  }
}
