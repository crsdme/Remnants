import type {
  AuthUser,
  // CurrencyDTO,
  // ExpenseCategoryDTO,
  // ExpenseDTO,
  GetOrderStatisticRequest,
  GetStatisticResponse,
  // OrderItemDTO,
  // OrderPaymentDTO,
} from '@remnant/shared'
import * as ExpenseService from '@/services/expense.service'
import * as OrderPaymentService from '@/services/order-payment.service'
import * as OrderService from '@/services/order.service'
// import * as UserService from '@/services/user.service'
import {
  parseGetExpenses,
  parseGetOrderItems,
  parseGetOrderPayments,
  parseGetOrders,
} from '@/types'

export async function get({ payload, user }: { payload: GetOrderStatisticRequest, user: AuthUser }): Promise<GetStatisticResponse> {
  const { date } = payload.filters || {}

  // const hasProfitPermission = await UserService.checkPermission('order.profit', user.id)

  const { data: { items: orders } } = await OrderService.get({
    payload: parseGetOrders({ filters: { createdAt: date, removed: false }, pagination: { full: true } }),
    user,
  })

  const orderIds = orders.map(order => order.id)

  const { data: { items: orderItemsCreated } } = await OrderService.getItems({
    payload: parseGetOrderItems({ filters: { order: orderIds, showFullData: true }, pagination: { full: true } }),
    user,
  })

  const { data: { items: paymentsForOrders } } = await OrderPaymentService.get({
    payload: parseGetOrderPayments({ filters: { order: orderIds }, pagination: { full: true } }),
  })

  const { data: { items: paymentsByDate, pagination: { total: orderPaymentsCount } } } = await OrderPaymentService.get({
    payload: parseGetOrderPayments({ filters: { paymentDate: date }, pagination: { full: true } }),
  })

  // const { data: { items: expenses, pagination: { total: expensesCount } } } = await ExpenseService.get({
  //   payload: parseGetExpenses({ filters: { createdAt: date }, pagination: { full: true } }),
  // })

  console.log(orderItemsCreated, paymentsForOrders, paymentsByDate)

  // const { paid, unpaid } = calcPaidUnpaid(orders, orderItemsCreated, paymentsForOrders)

  // const statistics = {
  //   range: date,
  //   orders: {
  //     count: orders.length,
  //     amount: sumOrdersItemsAmount(orderItemsCreated),
  //     paid: {
  //       count: paid.count,
  //       amount: paid.amount,
  //     },
  //     unpaid: {
  //       count: unpaid.count,
  //       amount: unpaid.amount,
  //     },
  //   },
  //   payments: {
  //     count: orderPaymentsCount,
  //     amount: sumPaymentsAmount(paymentsByDate),
  //     income: {
  //       count: orderPaymentsCount,
  //       amount: sumPaymentsAmount(paymentsByDate),
  //     },
  //     expense: {
  //       count: expensesCount,
  //       categories: groupExpenses(expenses),
  //       amount: sumExpensesAmount(expenses),
  //     },
  //     profit: {
  //       count: orderPaymentsCount,
  //       amount: diffMoney(sumPaymentsAmount(paymentsByDate), sumExpensesAmount(expenses)),
  //     },
  //   },
  //   products: {
  //     count: 0,
  //     // attributes: aggregateProductAttributes(orderItemsCreated),
  //     // categories: aggregateProductCategories(orderItemsCreated),
  //   },
  // }

  const statistics = {
    range: date,
    orders: {
      count: orders.length,
      amount: [],
      paid: {
        count: 0,
        amount: [],
      },
      unpaid: {
        count: 0,
        amount: [],
      },
    },
    payments: {
      count: orderPaymentsCount,
      amount: [],
      income: {
        count: orderPaymentsCount,
        amount: [],
      },
      expense: {
        count: 0,
        categories: [],
        amount: [],
      },
      profit: {
        count: orderPaymentsCount,
        amount: [],
      },
    },
    products: {
      count: 0,
      // attributes: aggregateProductAttributes(orderItemsCreated),
      // categories: aggregateProductCategories(orderItemsCreated),
    },
  }

  console.log(statistics)

  return {
    status: 'success',
    code: 'STATISTICS_FETCHED',
    message: 'Statistics fetched',
    // statistics,
  }
}

// function sumOrdersItemsAmount(orderItems: OrderItem[]) {
//   const amountMap: Record<string, { currency: any, total: number }> = {}

//   for (const it of orderItems) {
//     const price = Number(it.price) || 0
//     const qty = Number(it.quantity) || 0
//     addMoney(amountMap, it.currency, price * qty)
//   }

//   return mapToMoneyArray(amountMap)
// }

// function sumPaymentsAmount(orderPayments: OrderPayment[]) {
//   const amountMap: Record<string, { currency: any, total: number }> = {}

//   for (const p of orderPayments) {
//     addMoney(amountMap, p.currency, Number(p.amount) || 0)
//   }

//   return mapToMoneyArray(amountMap)
// }

// function sumExpensesAmount(expenses: Expense[]) {
//   const amountMap: Record<string, { currency: any, total: number }> = {}

//   for (const e of expenses) {
//     addMoney(amountMap, e.currency, Number(e.amount) || 0)
//   }

//   return mapToMoneyArray(amountMap)
// }

// function calcPaidUnpaid(
//   orders: { id: string }[],
//   orderItems: OrderItemDTO[],
//   orderPayments: OrderPaymentDTO[],
// ) {
//   const totals: Record<string, Record<string, { currency: CurrencyDTO, total: number }>> = {}
//   for (const it of orderItems) {
//     const orderId = String((it as any).order?.id ?? (it as any).order)
//     const currencyId = it.currency?.id
//     if (!orderId || !currencyId)
//       continue

//     const amount = (Number(it.price) || 0) * (Number(it.quantity) || 0)
//     totals[orderId] ||= {}
//     totals[orderId][currencyId] ||= { currency: it.currency, total: 0 }
//     totals[orderId][currencyId].total += amount
//   }

//   const paidMap: Record<string, Record<string, { currency: any, paid: number }>> = {}
//   for (const p of orderPayments) {
//     const orderId = String((p as any).order?.id ?? (p as any).order)
//     const currencyId = p.currency?.id
//     if (!orderId || !currencyId)
//       continue

//     paidMap[orderId] ||= {}
//     paidMap[orderId][currencyId] ||= { currency: p.currency, paid: 0 }
//     paidMap[orderId][currencyId].paid += Number(p.amount) || 0
//   }

//   const paidAmountMap: Record<string, { currency: any, total: number }> = {}
//   const unpaidAmountMap: Record<string, { currency: any, total: number }> = {}
//   let paidCount = 0
//   let unpaidCount = 0

//   for (const o of orders) {
//     const orderId = String(o.id)
//     const orderTotals = totals[orderId]

//     if (!orderTotals) {
//       unpaidCount += 1
//       continue
//     }

//     let isFullyPaid = true

//     for (const currencyId of Object.keys(orderTotals)) {
//       const { currency, total } = orderTotals[currencyId]
//       const paid = paidMap[orderId]?.[currencyId]?.paid ?? 0

//       const paidPart = Math.min(paid, total)
//       const remain = Math.max(0, total - paid)

//       addMoney(paidAmountMap, currency, paidPart)
//       addMoney(unpaidAmountMap, currency, remain)

//       if (remain > 0)
//         isFullyPaid = false
//     }

//     if (isFullyPaid)
//       paidCount++
//     else unpaidCount++
//   }

//   return {
//     paid: { count: paidCount, amount: mapToMoneyArray(paidAmountMap) },
//     unpaid: { count: unpaidCount, amount: mapToMoneyArray(unpaidAmountMap) },
//   }
// }

// function groupExpenses(expenses: ExpenseDTO[]) {
//   const result: Record<string, { category: ExpenseCategoryDTO, total: number, currencies: Record<string, { currency: CurrencyDTO, total: number, count: number }>, count: number }> = {}

//   for (const expense of expenses) {
//     const amount = expense.amount || 0
//     const currencyId = expense.currency.id

//     for (const category of expense.categories) {
//       const categoryId = category.id

//       if (!result[categoryId]) {
//         result[categoryId] = {
//           category,
//           total: 0,
//           currencies: {},
//           count: 0,
//         }
//       }

//       result[categoryId].total += Number.parseFloat(amount.toFixed(2))
//       result[categoryId].count += 1

//       if (!result[categoryId].currencies[currencyId]) {
//         result[categoryId].currencies[currencyId] = {
//           currency: expense.currency,
//           total: 0,
//           count: 0,
//         }
//       }
//       result[categoryId].currencies[currencyId].total += Number.parseFloat(
//         amount.toFixed(2),
//       )
//       result[categoryId].currencies[currencyId].count += 1
//     }
//   }

//   return Object.values(result).map((cat: any) => ({
//     category: cat.category,
//     total: cat.total,
//     count: cat.count,
//     currencies: Object.values(cat.currencies),
//   }))
// }

// interface MoneyRow { currency: any, total: number }

// function addMoney(
//   map: Record<string, { currency: any, total: number }>,
//   currency: any,
//   amount: number,
// ) {
//   if (!currency?.id)
//     return
//   const id = currency.id
//   if (!map[id])
//     map[id] = { currency, total: 0 }
//   map[id].total += amount
// }

// function diffMoney(income: MoneyRow[], expense: MoneyRow[]): MoneyRow[] {
//   const map: Record<string, { currency: any, total: number }> = {}

//   for (const r of income) {
//     addMoney(map, r.currency, Number(r.total) || 0)
//   }

//   for (const r of expense) {
//     addMoney(map, r.currency, -(Number(r.total) || 0))
//   }

//   return mapToMoneyArray(map)
// }

// function mapToMoneyArray(
//   map: Record<string, { currency: any, total: number }>,
// ): MoneyRow[] {
//   return Object.values(map).map(x => ({
//     currency: x.currency,
//     total: Number.parseFloat((x.total || 0).toFixed(2)),
//   }))
// }
