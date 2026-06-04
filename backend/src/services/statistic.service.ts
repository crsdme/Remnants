import type {
  Expense,
  GetStatisticParams,
  GetStatisticResponse,
  OrderItem,
  OrderPayment,
} from '@remnant/shared'
import * as ExpenseService from '@/services/expense.service'
import * as OrderPaymentService from '@/services/order-payment.service'
import * as OrderService from '@/services/order.service'

export async function get(payload: GetStatisticParams): Promise<GetStatisticResponse> {
  const { date } = payload.filters || {}

  const { data: { items: orders } } = await OrderService.get({
    filters: {
      createdAt: date,
      removed: false,
    },
    pagination: { full: true },
  })

  const orderIds = orders.map(order => order.id)

  const { data: { items: orderItemsCreated } } = await OrderService.getItems({
    filters: {
      order: orderIds,
      showFullData: true,
    },
    pagination: { full: true },
  })

  const { data: { items: paymentsForOrders } } = await OrderPaymentService.get({
    filters: { order: orderIds },
    pagination: { full: true },
  })

  const { data: { items: paymentsByDate, totalCount: orderPaymentsCount } } = await OrderPaymentService.get({
    filters: { paymentDate: date },
    pagination: { full: true },
  })

  const { data: { items: expenses, pagination: { total: expensesCount } } } = await ExpenseService.get({
    filters: {
      createdAt: date,
    },
    pagination: { full: true },
  })

  const { paid, unpaid } = calcPaidUnpaid(orders, orderItemsCreated, paymentsForOrders)

  console.log(JSON.stringify(orders, null, 2))

  const statistics = {
    range: date,
    orders: {
      count: orders.length,
      amount: sumOrdersItemsAmount(orderItemsCreated),
      paid: {
        count: paid.count,
        amount: paid.amount,
      },
      unpaid: {
        count: unpaid.count,
        amount: unpaid.amount,
      },
    },
    payments: {
      count: orderPaymentsCount,
      amount: sumPaymentsAmount(paymentsByDate),
      income: {
        count: orderPaymentsCount,
        amount: sumPaymentsAmount(paymentsByDate),
      },
      expense: {
        count: expensesCount,
        categories: groupExpenses(expenses),
        amount: sumExpensesAmount(expenses),
      },
      profit: {
        count: orderPaymentsCount,
        amount: diffMoney(sumPaymentsAmount(paymentsByDate), sumExpensesAmount(expenses)),
      },
    },
    products: {
      count: 0,
      // attributes: aggregateProductAttributes(orderItemsCreated),
      // categories: aggregateProductCategories(orderItemsCreated),
    },
  }

  // console.log(JSON.stringify(statistics, null, 2))
  // const { expenses, expensesCount } = await ExpenseService.get({
  //   filters: {
  //     createdAt: date,
  //   },
  //   pagination: { full: true },
  // })

  // let products: any[] = []

  // if (orders.length > 0) {
  //   const { orderItems } = await OrderService.getItems({
  //     filters: {
  //       order: orders.map(order => order.id),
  //       showFullData: true,
  //     },
  //     pagination: { full: true },
  //   })
  //   products = orderItems
  // }

  // const totalPrice = Object.values(
  //   products.reduce((acc, item) => {
  //     const { currency, price, quantity } = item

  //     if (!acc[currency.id]) {
  //       acc[currency.id] = { currency, total: 0 }
  //     }

  //     acc[currency.id].total += price * quantity
  //     return acc
  //   }, {}),
  // )

  // PAID UNPAID

  // let paidCount = 0
  // let unpaidCount = 0

  // const paidAmountMap = {} as any
  // const unpaidAmountMap = {} as any

  // for (const order of orders) {
  //   const { orderPayments } = await OrderService.getOrderPayments({
  //     filters: { order: order.id },
  //     pagination: { full: true },
  //   })
  //   const { orderItems } = (await OrderService.getItems({
  //     filters: { order: [order.id], showFullData: true },
  //     pagination: { full: true },
  //   })) as any

  //   const itemsByCurrency = new Map<string, { currency: any, total: number }>()

  //   for (const item of orderItems) {
  //     const currencyId = item.currency.id
  //     if (!itemsByCurrency.has(currencyId)) {
  //       itemsByCurrency.set(currencyId, { currency: item.currency, total: 0 })
  //     }
  //     const entry = itemsByCurrency.get(currencyId)!
  //     entry.total += item.price * item.quantity
  //   }

  //   const paymentTotal = orderPayments.reduce((sum, p) => sum + p.amount, 0)

  //   for (const [
  //     currencyId,
  //     { currency, total: orderTotal },
  //   ] of itemsByCurrency.entries()) {
  //     const remaining = orderTotal - paymentTotal

  //     if (paymentTotal > 0) {
  //       if (!paidAmountMap[currencyId]) {
  //         paidAmountMap[currencyId] = { currency, total: 0 }
  //       }
  //       paidAmountMap[currencyId].total += Math.min(paymentTotal, orderTotal)
  //       paidCount++
  //     }

  //     if (remaining > 0) {
  //       if (!unpaidAmountMap[currencyId]) {
  //         unpaidAmountMap[currencyId] = { currency, total: 0 }
  //       }
  //       unpaidAmountMap[currencyId].total += remaining
  //       unpaidCount++
  //     }
  //   }
  // }

  // const paidAmount = Object.values(paidAmountMap)
  // const unpaidAmount = Object.values(unpaidAmountMap)

  // PAID UNPAID

  // INCOME

  // const incomeMap = {} as Record<string, { currency: any, total: number }>

  // for (const order of orders) {
  //   if ((order as any).orderPaymentStatus !== 'paid')
  //     continue

  //   const { orderItems } = await OrderService.getItems({
  //     filters: {
  //       order: [order.id],
  //       showFullData: true,
  //     },
  //     pagination: { full: true },
  //   })

  //   for (const item of orderItems) {
  //     const { currency, profit } = item as any
  //     const currencyId = currency.id

  //     if (!incomeMap[currencyId]) {
  //       incomeMap[currencyId] = { currency, total: 0 }
  //     }

  //     incomeMap[currencyId].total += Number.parseFloat(
  //       (profit * item.quantity).toFixed(2),
  //     )
  //   }
  // }

  // const income = Object.values(incomeMap)

  // PAID UNPAID

  // const expensesTotal = Object.values(
  //   expenses.reduce((acc: any, item: any) => {
  //     const { currency, amount } = item

  //     if (!acc[currency.id]) {
  //       acc[currency.id] = { currency, total: 0 }
  //     }

  //     acc[currency.id].total += Number.parseFloat(amount.toFixed(2))
  //     return acc
  //   }, {}),
  // )

  // const profit = income.map((inc: any) => {
  //   const expense = expensesTotal.find(
  //     (e: any) => e.currency?.id === inc.currency?.id,
  //   ) as any
  //   const expensesSum = expense?.total || 0
  //   return {
  //     currency: inc.currency,
  //     total: Number.parseFloat((inc.total - expensesSum).toFixed(2)),
  //   }
  // })

  // expensesTotal.forEach((exp: any) => {
  //   if (!profit.find((p: any) => p.currency?.id === exp.currency?.id)) {
  //     profit.push({
  //       currency: exp.currency,
  //       total: Number.parseFloat((0 - exp.total).toFixed(2)),
  //     })
  //   }
  // })

  // const mappedExpenses = groupExpensesByCategoryAndCurrency(expenses)

  // const productAttributes = aggregateProductAttributes(products)

  // const productCategories = aggregateProductCategories(products)

  // const profitFull = await getProfit(payload)

  // const statistics = {
  //   ordersCount,
  //   // ordersAmount: totalPrice,
  //   orderAmount: [],
  //   paidCount: 0,
  //   paidAmount: [],
  //   unpaidCount: 0,
  //   unpaidAmount: [],
  //   averageCheck: 0,
  //   income: [],
  //   incomeCount: orders.filter(
  //     (order: any) => order.orderPaymentStatus === 'paid',
  //   ).length,
  //   profit: [],
  //   profitFull,
  //   // expenses: mappedExpenses,
  //   expenses: [],
  //   expensesCount: 0,
  //   expensesTotal: [],
  //   productAttributes: [],
  //   productCategories: [],
  // }

  return {
    status: 'success',
    code: 'STATISTICS_FETCHED',
    message: 'Statistics fetched',
    statistics,
  }
}

function sumOrdersItemsAmount(orderItems: OrderItem[]) {
  const amountMap: Record<string, { currency: any, total: number }> = {}

  for (const it of orderItems) {
    const price = Number(it.price) || 0
    const qty = Number(it.quantity) || 0
    addMoney(amountMap, it.currency, price * qty)
  }

  return mapToMoneyArray(amountMap)
}

function sumPaymentsAmount(orderPayments: OrderPayment[]) {
  const amountMap: Record<string, { currency: any, total: number }> = {}

  for (const p of orderPayments) {
    addMoney(amountMap, p.currency, Number(p.amount) || 0)
  }

  return mapToMoneyArray(amountMap)
}

function sumExpensesAmount(expenses: Expense[]) {
  const amountMap: Record<string, { currency: any, total: number }> = {}

  for (const e of expenses) {
    addMoney(amountMap, e.currency, Number(e.amount) || 0)
  }

  return mapToMoneyArray(amountMap)
}

// function sumOrders(orderPayments: OrderPayment[]) {
//   const amountMap: Record<string, { currency: any, total: number }> = {}

//   for (const p of orderPayments) {
//     addMoney(amountMap, p.currency, Number(p.amount) || 0)
//   }

//   return mapToMoneyArray(amountMap)
// }

function calcPaidUnpaid(
  orders: { id: string }[],
  orderItems: OrderItem[],
  orderPayments: OrderPayment[],
) {
  const totals: Record<string, Record<string, { currency: any, total: number }>> = {}
  for (const it of orderItems) {
    const orderId = String((it as any).order?.id ?? (it as any).order)
    const currencyId = it.currency?.id
    if (!orderId || !currencyId)
      continue

    const amount = (Number(it.price) || 0) * (Number(it.quantity) || 0)
    totals[orderId] ||= {}
    totals[orderId][currencyId] ||= { currency: it.currency, total: 0 }
    totals[orderId][currencyId].total += amount
  }

  const paidMap: Record<string, Record<string, { currency: any, paid: number }>> = {}
  for (const p of orderPayments) {
    const orderId = String((p as any).order?.id ?? (p as any).order)
    const currencyId = p.currency?.id
    if (!orderId || !currencyId)
      continue

    paidMap[orderId] ||= {}
    paidMap[orderId][currencyId] ||= { currency: p.currency, paid: 0 }
    paidMap[orderId][currencyId].paid += Number(p.amount) || 0
  }

  const paidAmountMap: Record<string, { currency: any, total: number }> = {}
  const unpaidAmountMap: Record<string, { currency: any, total: number }> = {}
  let paidCount = 0
  let unpaidCount = 0

  for (const o of orders) {
    const orderId = String(o.id)
    const orderTotals = totals[orderId]

    if (!orderTotals) {
      unpaidCount += 1
      continue
    }

    let isFullyPaid = true

    for (const currencyId of Object.keys(orderTotals)) {
      const { currency, total } = orderTotals[currencyId]
      const paid = paidMap[orderId]?.[currencyId]?.paid ?? 0

      const paidPart = Math.min(paid, total)
      const remain = Math.max(0, total - paid)

      addMoney(paidAmountMap, currency, paidPart)
      addMoney(unpaidAmountMap, currency, remain)

      if (remain > 0)
        isFullyPaid = false
    }

    if (isFullyPaid)
      paidCount++
    else unpaidCount++
  }

  return {
    paid: { count: paidCount, amount: mapToMoneyArray(paidAmountMap) },
    unpaid: { count: unpaidCount, amount: mapToMoneyArray(unpaidAmountMap) },
  }
}

function groupExpenses(expenses: any[]) {
  const result = {} as any

  for (const expense of expenses) {
    const amount = expense.amount || 0
    const currencyId = expense.currency.id

    for (const category of expense.categories) {
      const categoryId = category.id

      if (!result[categoryId]) {
        result[categoryId] = {
          category,
          total: 0,
          currencies: {},
          count: 0,
        }
      }

      result[categoryId].total += Number.parseFloat(amount.toFixed(2))
      result[categoryId].count += 1

      if (!result[categoryId].currencies[currencyId]) {
        result[categoryId].currencies[currencyId] = {
          currency: expense.currency,
          total: 0,
          count: 0,
        }
      }
      result[categoryId].currencies[currencyId].total += Number.parseFloat(
        amount.toFixed(2),
      )
      result[categoryId].currencies[currencyId].count += 1
    }
  }

  return Object.values(result).map((cat: any) => ({
    category: cat.category,
    total: cat.total,
    count: cat.count,
    currencies: Object.values(cat.currencies),
  }))
}

interface MoneyRow { currency: any, total: number }

function addMoney(
  map: Record<string, { currency: any, total: number }>,
  currency: any,
  amount: number,
) {
  if (!currency?.id)
    return
  const id = currency.id
  if (!map[id])
    map[id] = { currency, total: 0 }
  map[id].total += amount
}

function diffMoney(income: MoneyRow[], expense: MoneyRow[]): MoneyRow[] {
  const map: Record<string, { currency: any, total: number }> = {}

  for (const r of income) {
    addMoney(map, r.currency, Number(r.total) || 0)
  }

  for (const r of expense) {
    addMoney(map, r.currency, -(Number(r.total) || 0))
  }

  return mapToMoneyArray(map)
}

function mapToMoneyArray(
  map: Record<string, { currency: any, total: number }>,
): MoneyRow[] {
  return Object.values(map).map(x => ({
    currency: x.currency,
    total: Number.parseFloat((x.total || 0).toFixed(2)),
  }))
}

// type PropType = 'number' | 'boolean' | 'select' | 'multiSelect' | 'color'

// function aggregateProductAttributes(products: any[]) {
//   const acc = new Map<string, any>()

//   for (const item of products) {
//     const qty = Number(item.quantity) || 1
//     const props = item?.product?.productProperties as any[] | undefined
//     if (!props?.length)
//       continue

//     for (const prop of props) {
//       const propId = prop.id || prop.data?.id || prop.data?._id
//       const type = prop.data?.type as PropType
//       const nameRu = prop.data?.names?.ru || prop.data?.names?.en || propId

//       if (!propId || !type || !prop.data?.showInStatistics)
//         continue

//       if (!acc.has(propId)) {
//         acc.set(propId, {
//           id: propId,
//           name: { ru: nameRu, en: prop.data?.names?.en },
//           type,
//           sum: 0,
//           min: Infinity,
//           max: -Infinity,
//           count: 0,
//           trueCount: 0,
//           falseCount: 0,
//           options: new Map<
//             string,
//             { id: string, name: any, color?: string, count: number }
//           >(),
//         })
//       }

//       const agg = acc.get(propId)

//       const optionById = new Map<string, any>()
//       if (Array.isArray(prop.optionData)) {
//         for (const o of prop.optionData) {
//           optionById.set(String(o.id), o)
//         }
//       }

//       switch (type) {
//         case 'number': {
//           const v = Number(prop.value)
//           if (Number.isFinite(v)) {
//             agg.sum += v * qty
//             agg.min = Math.min(agg.min, v)
//             agg.max = Math.max(agg.max, v)
//             agg.count += qty
//           }
//           break
//         }

//         case 'boolean': {
//           const v = Boolean(prop.value)
//           if (v) {
//             agg.trueCount += qty
//             agg.count += qty
//           }
//           else {
//             agg.falseCount += qty
//             agg.count += qty
//           }
//           break
//         }

//         case 'select':
//         case 'color': {
//           const optId = String(prop.value)
//           if (!optId)
//             break
//           if (!agg.options.has(optId)) {
//             const meta = optionById.get(optId)
//             agg.options.set(optId, {
//               id: optId,
//               name: meta?.names || { ru: optId },
//               color: meta?.color,
//               count: 0,
//             })
//           }
//           agg.options.get(optId)!.count += qty
//           agg.count += qty
//           break
//         }

//         case 'multiSelect': {
//           const values = Array.isArray(prop.value)
//             ? prop.value
//             : prop.value
//               ? [prop.value]
//               : []
//           for (const raw of values) {
//             const optId = String(raw)
//             if (!optId)
//               continue
//             if (!agg.options.has(optId)) {
//               const meta = optionById.get(optId)
//               agg.options.set(optId, {
//                 id: optId,
//                 name: meta?.names || { ru: optId },
//                 color: meta?.color,
//                 count: 0,
//               })
//             }
//             agg.options.get(optId)!.count += qty
//           }
//           agg.count += qty
//           break
//         }
//       }
//     }
//   }

//   const result = []
//   for (const [, a] of acc) {
//     const out: any = {
//       id: a.id,
//       name: a.name,
//       type: a.type as PropType,
//       count: a.count,
//     }

//     if (a.type === 'number') {
//       const avg = a.count > 0 ? a.sum / a.count : 0
//       out.number = {
//         sum: a.sum,
//         min: a.count > 0 ? a.min : 0,
//         max: a.count > 0 ? a.max : 0,
//         avg,
//         count: a.count,
//       }
//     }

//     if (a.type === 'boolean') {
//       out.boolean = {
//         true: a.trueCount,
//         false: a.falseCount,
//       }
//     }

//     if (a.type === 'select' || a.type === 'multiSelect' || a.type === 'color') {
//       out.options = Array.from(a.options.values()).sort(
//         (x: any, y: any) => y.count - x.count,
//       )
//     }

//     result.push(out)
//   }

//   return result.sort((x: any, y: any) => {
//     const getScore = (o: any) => {
//       if (o.type === 'number')
//         return o.number?.sum ?? 0
//       if (o.type === 'boolean')
//         return (o.boolean?.true ?? 0) + (o.boolean?.false ?? 0)
//       if (o.options)
//         return o.options.reduce((s: number, v: any) => s + v.count, 0)
//       return 0
//     }
//     return getScore(y) - getScore(x)
//   })
// }

// function aggregateProductCategories(products: any[]) {
//   const acc = new Map<string, any>()

//   for (const item of products) {
//     const categories = item.product.categories as any[]
//     const unit = item.product.unit

//     if (!categories?.length)
//       continue

//     for (const category of categories) {
//       const categoryId = String(category.id ?? category._id ?? category)
//       if (!categoryId)
//         continue

//       if (!acc.has(categoryId)) {
//         acc.set(categoryId, {
//           id: categoryId,
//           names: category.names,
//           count: 0,
//           units: new Map(),
//         })
//       }
//       const cat = acc.get(categoryId)!

//       cat.count += 1

//       if (!cat.units.has(unit.id)) {
//         cat.units.set(unit.id, {
//           id: unit.id,
//           symbols: unit.symbols,
//           count: 0,
//           quantity: 0,
//         })
//       }
//       const u = cat.units.get(unit.id)!
//       u.count += 1
//       u.quantity += Number(item.quantity)
//     }
//   }

//   const result = []
//   for (const [, cat] of acc) {
//     const units = Array.from(cat.units.values())
//       .map((u: any) => ({
//         id: u.id,
//         symbols: u.symbols,
//         count: u.count,
//         quantity: u.quantity,
//       }))
//       .sort((a, b) => b.count - a.count || b.quantity - a.quantity)

//     result.push({
//       id: cat.id,
//       names: cat.names,
//       count: cat.count,
//       units,
//     })
//   }

//   // крупные категории сверху
//   return result.sort((a, b) => b.count - a.count || b.count - a.count)
// }

// export async function getProfit(payload: any) {
//   const { date } = payload.filters || {}

//   // 1) Берём только ОПЛАЧЕННЫЕ платежи за выбранный период (по paymentDate)
//   const { orderPayments } = await OrderPaymentService.get({
//     filters: {
//       paymentDate: date,
//     },
//     pagination: { full: true },
//   })

//   if (!orderPayments?.length)
//     return []

//   // 2) Собираем orderIds из платежей
//   const orderIds = Array.from(new Set(orderPayments.map((p: any) => p.order)))

//   // 3) Забираем items по этим заказам (независимо от createdAt заказа)
//   const { orderItems } = await OrderService.getItems({
//     filters: {
//       order: orderIds,
//       showFullData: true,
//     },
//     pagination: { full: true },
//   })

//   // 4) Готовим агрегаты по заказу+валюте:
//   //    salesTotal = сумма продаж (price * qty)
//   //    wholesaleTotal = сумма себестоимости (wholesalePrice * qty)
//   const byOrderCurrency: Record<
//     string,
//     { currency: any, total: number, purchaseTotal: number }
//   > = {}

//   for (const item of orderItems || []) {
//     const currency = item.currency
//     const currencyId = currency?.id

//     if (!currencyId)
//       continue

//     const key = `${item.order}:${currencyId}`

//     if (!byOrderCurrency[key]) {
//       byOrderCurrency[key] = { currency, total: 0, purchaseTotal: 0 }
//     }

//     const qty = Number(item.quantity) || 0
//     const price = Number(item.price) || 0

//     const purchasePrice = Number((item as any).purchasePrice) || 0

//     byOrderCurrency[key].total += price * qty
//     byOrderCurrency[key].purchaseTotal += purchasePrice * qty
//   }

//   // 5) Сумма оплаченного за период по заказу+валюте
//   const paidByOrderCurrency: Record<string, { currency: any, paid: number }> = {}

//   for (const p of orderPayments) {
//     const currencyId = p.currency?.id
//     const currency = p.currency
//     if (!currencyId)
//       continue

//     const key = `${p.order}:${currencyId}`

//     if (!paidByOrderCurrency[key]) {
//       paidByOrderCurrency[key] = { currency, paid: 0 }
//     }

//     paidByOrderCurrency[key].paid += Number(p.amount) || 0
//   }

//   // 6) Profit за период:
//   //    profit = paidPart - (wholesaleTotal * (paidPart / salesTotal))
//   //    (то есть себестоимость учитываем пропорционально оплате)
//   const profitMap: Record<string, { currency: any, total: number }> = {}

//   for (const key of Object.keys(paidByOrderCurrency)) {
//     const paidEntry = paidByOrderCurrency[key]
//     const baseEntry = byOrderCurrency[key]
//     if (!baseEntry)
//       continue

//     const paid = Number(paidEntry.paid || 0)
//     if (paid <= 0)
//       continue

//     const purchaseTotal = Number(baseEntry.purchaseTotal || 0)

//     const profit = paid - purchaseTotal

//     const currency
//       = baseEntry.currency || paidEntry.currency
//     const currencyId
//       = currency?.id || key.split(':')[1]

//     if (!profitMap[currencyId]) {
//       profitMap[currencyId] = {
//         currency,
//         total: 0,
//       }
//     }

//     profitMap[currencyId].total += profit
//   }

//   return Object.values(profitMap).map((x: any) => ({
//     currency: x.currency,
//     total: Number.parseFloat((x.total || 0).toFixed(2)),
//   }))
// }
