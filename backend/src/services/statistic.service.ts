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
    },
    pagination: { full: true },
  })

  const { expenses, expensesCount } = await ExpenseService.get({
    filters: {
      createdAt: date,
    },
  })

  let products: any[] = []

  if (orders.length > 0) {
    const { orderItems } = await OrderService.getItems({
      filters: {
        order: orders.map(order => order.id),
        showFullData: true,
      },
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

  const income = Object.values(
    products.reduce((acc, item) => {
      const { currency, profit } = item

      if (!acc[currency.id]) {
        acc[currency.id] = { currency, total: 0 }
      }

      acc[currency.id].total += profit
      return acc
    }, {}),
  )

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

  const paidIds = orders.filter((order: any) => ['paid', 'partially_paid', 'overpaid'].includes(order.orderPaymentStatus)).map(order => order.id)

  const paidCount = paidIds.length

  let paidAmount: any[] = []

  if (paidIds.length > 0) {
    const { orderItems: paidOrderItems } = await OrderService.getItems({
      filters: {
        order: paidIds,
        showFullData: true,
      },
    })

    paidAmount = Object.values(
      paidOrderItems.reduce((acc: any, item: any) => {
        const { currency, price, quantity } = item

        if (!acc[currency.id]) {
          acc[currency.id] = { currency, total: 0 }
        }

        acc[currency.id].total += price * quantity
        return acc
      }, {}),
    )
  }

  const unpaidIds = orders.filter((order: any) => ['unpaid'].includes(order.orderPaymentStatus)).map(order => order.id)

  const unpaidCount = unpaidIds.length

  let unpaidAmount: any[] = []

  if (paidIds.length > 0) {
    const { orderItems: unpaidOrderItems } = await OrderService.getItems({
      filters: {
        order: unpaidIds,
        showFullData: true,
      },
    })

    unpaidAmount = Object.values(
      unpaidOrderItems.reduce((acc: any, item: any) => {
        const { currency, price, quantity } = item

        if (!acc[currency.id]) {
          acc[currency.id] = { currency, total: 0 }
        }

        acc[currency.id].total += price * quantity
        return acc
      }, {}),
    )
  }

  const statistics = {
    ordersCount,
    ordersAmount: totalPrice,
    paidCount,
    paidAmount,
    unpaidCount,
    unpaidAmount,
    averageCheck: 0,
    income,
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
