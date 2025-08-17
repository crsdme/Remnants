import type * as StatisticTypes from '../types/statistic.type'
import * as ExpenseService from './expense.service'
import * as OrderService from './order.service'

export async function get(payload: StatisticTypes.getStatisticParams): Promise<StatisticTypes.getStatisticResult> {
  const {
    date,
  } = payload.filters || {}

  const { orders, ordersCount } = await OrderService.get({
    filters: {
      createdAt: date,
      removed: false,
    },
    pagination: { full: true },
  })

  const { expenses, expensesCount } = await ExpenseService.get({
    filters: {
      createdAt: date,
    },
    pagination: { full: true },
  })

  let products: any[] = []

  if (orders.length > 0) {
    const { orderItems } = await OrderService.getItems({
      filters: {
        order: orders.map(order => order.id),
        showFullData: true,
      },
      pagination: { full: true },
    })
    products = orderItems
  }

  const totalPrice = Object.values(
    products.reduce((acc, item) => {
      const { currency, price, quantity } = item

      if (!acc[currency.id]) {
        acc[currency.id] = { currency, total: 0 }
      }

      acc[currency.id].total += price * quantity
      return acc
    }, {}),
  )

  // PAID UNPAID

  let paidCount = 0
  let unpaidCount = 0

  const paidAmountMap = {} as any
  const unpaidAmountMap = {} as any

  for (const order of orders) {
    const { orderPayments } = await OrderService.getOrderPayments({ filters: { order: order.id }, pagination: { full: true } })
    const { orderItems } = await OrderService.getItems({ filters: { order: [order.id], showFullData: true }, pagination: { full: true } })

    const orderCurrency = orderItems[0]?.currency as any
    const orderTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const paymentTotal = orderPayments.reduce((sum, p) => sum + p.amount, 0)

    const currencyId = orderCurrency.id

    if (paymentTotal > 0) {
      if (!paidAmountMap[currencyId]) {
        paidAmountMap[currencyId] = { currency: orderCurrency, total: 0 }
      }
      paidAmountMap[currencyId].total += paymentTotal
      paidCount++
    }

    if (paymentTotal < orderTotal) {
      if (!unpaidAmountMap[currencyId]) {
        unpaidAmountMap[currencyId] = { currency: orderCurrency, total: 0 }
      }
      unpaidAmountMap[currencyId].total += (orderTotal - paymentTotal)
      unpaidCount++
    }
  }

  const paidAmount = Object.values(paidAmountMap)
  const unpaidAmount = Object.values(unpaidAmountMap)

  // PAID UNPAID

  // INCOME

  const incomeMap = {} as Record<string, { currency: any, total: number }>

  for (const order of orders) {
    if ((order as any).orderPaymentStatus !== 'paid')
      continue

    const { orderItems } = await OrderService.getItems({
      filters: {
        order: [order.id],
        showFullData: true,
      },
      pagination: { full: true },
    })

    for (const item of orderItems) {
      const { currency, profit } = item as any
      const currencyId = currency.id

      if (!incomeMap[currencyId]) {
        incomeMap[currencyId] = { currency, total: 0 }
      }

      incomeMap[currencyId].total += profit
    }
  }

  const income = Object.values(incomeMap)

  // PAID UNPAID

  // const income = Object.values(
  //   products.reduce((acc, item) => {
  //     console.log(item)
  //     const { currency, profit } = item

  //     if (!acc[currency.id]) {
  //       acc[currency.id] = { currency, total: 0 }
  //     }

  //     acc[currency.id].total += profit
  //     return acc
  //   }, {}),
  // )

  const expensesTotal = Object.values(
    expenses.reduce((acc: any, item: any) => {
      const { currency, amount } = item

      if (!acc[currency.id]) {
        acc[currency.id] = { currency, total: 0 }
      }

      acc[currency.id].total += amount
      return acc
    }, {}),
  )

  const profit = income.map((inc: any) => {
    const expense = expensesTotal.find((e: any) => e.currency?.id === inc.currency?.id) as any
    const expensesSum = expense?.total || 0
    return {
      currency: inc.currency,
      total: inc.total - expensesSum,
    }
  })

  expensesTotal.forEach((exp: any) => {
    if (!profit.find((p: any) => p.currency?.id === exp.currency?.id)) {
      profit.push({
        currency: exp.currency,
        total: 0 - exp.total,
      })
    }
  })

  function groupExpensesByCategoryAndCurrency(expenses: any[]) {
    const result = {} as any

    for (const expense of expenses) {
      const amount = expense.amount || 0
      const currencyId = expense.currency.id

      for (const cat of expense.categories) {
        const catId = cat.id

        if (!result[catId]) {
          result[catId] = {
            category: cat,
            total: 0,
            currencies: {},
            count: 0,
          }
        }

        result[catId].total += amount
        result[catId].count += 1

        if (!result[catId].currencies[currencyId]) {
          result[catId].currencies[currencyId] = {
            currency: expense.currency,
            total: 0,
            count: 0,
          }
        }
        result[catId].currencies[currencyId].total += amount
        result[catId].currencies[currencyId].count += 1
      }
    }

    return Object.values(result).map((cat: any) => ({
      category: cat.category,
      total: cat.total,
      count: cat.count,
      currencies: Object.values(cat.currencies),
    }))
  }

  const mappedExpenses = groupExpensesByCategoryAndCurrency(expenses)

  const statistics = {
    ordersCount,
    ordersAmount: totalPrice,
    paidCount,
    paidAmount,
    unpaidCount,
    unpaidAmount,
    averageCheck: 0,
    income,
    incomeCount: orders.filter((order: any) => order.orderPaymentStatus === 'paid').length,
    profit,
    expenses: mappedExpenses,
    expensesCount,
    expensesTotal,
  }

  return {
    status: 'success',
    code: 'STATISTICS_FETCHED',
    message: 'Statistics fetched',
    statistics,
  }
}
