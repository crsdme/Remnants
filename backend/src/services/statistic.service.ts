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

      incomeMap[currencyId].total += Number.parseFloat(profit.toFixed(2))
    }
  }

  const income = Object.values(incomeMap)

  // PAID UNPAID

  const expensesTotal = Object.values(
    expenses.reduce((acc: any, item: any) => {
      const { currency, amount } = item

      if (!acc[currency.id]) {
        acc[currency.id] = { currency, total: 0 }
      }

      acc[currency.id].total += Number.parseFloat(amount.toFixed(2))
      return acc
    }, {}),
  )

  const profit = income.map((inc: any) => {
    const expense = expensesTotal.find((e: any) => e.currency?.id === inc.currency?.id) as any
    const expensesSum = expense?.total || 0
    return {
      currency: inc.currency,
      total: Number.parseFloat((inc.total - expensesSum).toFixed(2)),
    }
  })

  expensesTotal.forEach((exp: any) => {
    if (!profit.find((p: any) => p.currency?.id === exp.currency?.id)) {
      profit.push({
        currency: exp.currency,
        total: Number.parseFloat((0 - exp.total).toFixed(2)),
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

        result[catId].total += Number.parseFloat(amount.toFixed(2))
        result[catId].count += 1

        if (!result[catId].currencies[currencyId]) {
          result[catId].currencies[currencyId] = {
            currency: expense.currency,
            total: 0,
            count: 0,
          }
        }
        result[catId].currencies[currencyId].total += Number.parseFloat(amount.toFixed(2))
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

  const productAttributes = aggregateProductAttributes(products)

  const productCategories = aggregateProductCategories(products)

  console.log(productCategories)

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
    productAttributes,
    productCategories,
  }

  return {
    status: 'success',
    code: 'STATISTICS_FETCHED',
    message: 'Statistics fetched',
    statistics,
  }
}

type PropType = 'number' | 'boolean' | 'select' | 'multiSelect' | 'color'

function aggregateProductAttributes(products: any[]) {
  const acc = new Map<string, any>()

  for (const item of products) {
    const qty = Number(item.quantity) || 1
    const props = item?.product?.productProperties as any[] | undefined
    if (!props?.length)
      continue

    for (const prop of props) {
      const propId = prop.id || prop.data?.id || prop.data?._id
      const type = prop.data?.type as PropType
      const nameRu = prop.data?.names?.ru || prop.data?.names?.en || propId

      if (!propId || !type)
        continue

      if (!acc.has(propId)) {
        acc.set(propId, {
          id: propId,
          name: { ru: nameRu, en: prop.data?.names?.en },
          type,
          sum: 0,
          min: Infinity,
          max: -Infinity,
          count: 0,
          trueCount: 0,
          falseCount: 0,
          options: new Map<string, { id: string, name: any, color?: string, count: number }>(),
        })
      }

      const agg = acc.get(propId)

      const optionById = new Map<string, any>()
      if (Array.isArray(prop.optionData)) {
        for (const o of prop.optionData) {
          optionById.set(String(o.id), o)
        }
      }

      switch (type) {
        case 'number': {
          const v = Number(prop.value)
          if (Number.isFinite(v)) {
            agg.sum += v * qty
            agg.min = Math.min(agg.min, v)
            agg.max = Math.max(agg.max, v)
            agg.count += qty
          }
          break
        }

        case 'boolean': {
          const v = Boolean(prop.value)
          if (v) {
            agg.trueCount += qty
            agg.count += qty
          }
          else {
            agg.falseCount += qty
            agg.count += qty
          }
          break
        }

        case 'select':
        case 'color': {
          const optId = String(prop.value)
          if (!optId)
            break
          if (!agg.options.has(optId)) {
            const meta = optionById.get(optId)
            agg.options.set(optId, {
              id: optId,
              name: meta?.names || { ru: optId },
              color: meta?.color,
              count: 0,
            })
          }
          agg.options.get(optId)!.count += qty
          agg.count += qty
          break
        }

        case 'multiSelect': {
          const values = Array.isArray(prop.value) ? prop.value : (prop.value ? [prop.value] : [])
          for (const raw of values) {
            const optId = String(raw)
            if (!optId)
              continue
            if (!agg.options.has(optId)) {
              const meta = optionById.get(optId)
              agg.options.set(optId, {
                id: optId,
                name: meta?.names || { ru: optId },
                color: meta?.color,
                count: 0,
              })
            }
            agg.options.get(optId)!.count += qty
          }
          agg.count += qty
          break
        }
      }
    }
  }

  const result = []
  for (const [, a] of acc) {
    const out: any = {
      id: a.id,
      name: a.name,
      type: a.type as PropType,
      count: a.count,
    }

    if (a.type === 'number') {
      const avg = a.count > 0 ? a.sum / a.count : 0
      out.number = {
        sum: a.sum,
        min: a.count > 0 ? a.min : 0,
        max: a.count > 0 ? a.max : 0,
        avg,
        count: a.count,
      }
    }

    if (a.type === 'boolean') {
      out.boolean = {
        true: a.trueCount,
        false: a.falseCount,
      }
    }

    if (a.type === 'select' || a.type === 'multiSelect' || a.type === 'color') {
      out.options = Array.from(a.options.values())
        .sort((x: any, y: any) => y.count - x.count)
    }

    result.push(out)
  }

  return result.sort((x: any, y: any) => {
    const getScore = (o: any) => {
      if (o.type === 'number')
        return o.number?.sum ?? 0
      if (o.type === 'boolean')
        return (o.boolean?.true ?? 0) + (o.boolean?.false ?? 0)
      if (o.options)
        return o.options.reduce((s: number, v: any) => s + v.count, 0)
      return 0
    }
    return getScore(y) - getScore(x)
  })
}

function aggregateProductCategories(products: any[]) {
  const acc = new Map<string, any>()

  for (const item of products) {
    const categories = item.product.categories as any[]
    const unit = item.product.unit

    if (!categories?.length)
      continue

    for (const category of categories) {
      const categoryId = String(category.id ?? category._id ?? category)
      if (!categoryId)
        continue

      if (!acc.has(categoryId)) {
        acc.set(categoryId, {
          id: categoryId,
          names: category.names,
          count: 0,
          units: new Map(),
        })
      }
      const cat = acc.get(categoryId)!

      cat.count += 1

      if (!cat.units.has(unit.id)) {
        cat.units.set(unit.id, {
          id: unit.id,
          symbols: unit.symbols,
          count: 0,
          quantity: 0,
        })
      }
      const u = cat.units.get(unit.id)!
      u.count += 1
      u.quantity += Number(item.quantity)
    }
  }

  const result = []
  for (const [, cat] of acc) {
    const units = Array.from(cat.units.values())
      .map((u: any) => ({
        id: u.id,
        symbols: u.symbols,
        count: u.count,
        quantity: u.quantity,
      }))
      .sort((a, b) => (b.count - a.count) || (b.quantity - a.quantity))

    result.push({
      id: cat.id,
      names: cat.names,
      count: cat.count,
      units,
    })
  }

  // крупные категории сверху
  return result.sort((a, b) => (b.count - a.count) || (b.count - a.count))
}
