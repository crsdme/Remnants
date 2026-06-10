import type {
  AuthUser,
  CashregisterDTO,
  CreateBalanceResponse,
  GetBalancesResponse,
  GetCurrentBalanceResponse,
  OrderItemDTO,
  OrderItemDTOPopulated,
  ProductDTO,
  RemoveBalancesResponse,
} from '@remnant/shared'
import type {
  CreateBalancesPayload,
  GetBalancesPayload,
  GetCurrentBalancePayload,
  RemoveBalancesPayload,
} from '@/types'
import { BalanceModel } from '@/models/'
import * as BalanceRepo from '@/repositories/balance.repo'
import * as CashregisterService from '@/services/cashregister.service'
import * as OrderStatusService from '@/services/order-status.service'
import * as OrderService from '@/services/order.service'
import * as ProductService from '@/services/product.service'
import {
  parseGetCashregisters,
  parseGetOrderItems,
  parseGetOrders,
  parseGetOrderStatuses,
  parseGetProductsRepo,
} from '@/types/'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetBalancesPayload }): Promise<GetBalancesResponse> {
  const { items, total, page, pageSize } = await BalanceRepo.list(payload)

  return {
    status: 'success',
    code: 'BALANCE_FETCHED',
    message: 'Balance fetched',
    data: {
      items,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function getCurrent({ payload, user }: { payload: GetCurrentBalancePayload, user: AuthUser }): Promise<GetCurrentBalanceResponse> {
  console.log(payload)
  const { data: { items: products } } = await ProductService.get({
    payload: parseGetProductsRepo({ pagination: { full: true } }),
    user,
  })

  function getWarehouseBalance(products: ProductDTO[]) {
    const outer = new Map<
      string,
      Map<
        string,
        { currencyId: string, currencySymbol?: string, currencyName?: string, quantity: number, amount: number }
      >
    >()

    for (const p of products ?? []) {
      const price = Number(p.purchasePrice ?? 0)
      const currencyId = p.purchaseCurrency?.id ?? 'UNKNOWN'
      const currencySymbol = p.purchaseCurrency?.symbols?.ru ?? p.purchaseCurrency?.symbols?.en
      const currencyName = p.purchaseCurrency?.names?.ru ?? p.purchaseCurrency?.names?.en

      for (const q of p.warehouseStock ?? []) {
        const warehouse = q.warehouse
        const cnt = Number(q.count) || 0

        let inner = outer.get(warehouse)
        if (!inner) {
          inner = new Map()
          outer.set(warehouse, inner)
        }

        let row = inner.get(currencyId)
        if (!row) {
          row = { currencyId, currencySymbol, currencyName, quantity: 0, amount: 0 }
          inner.set(currencyId, row)
        }

        row.quantity += cnt
        row.amount += cnt * price
      }
    }

    return Array.from(outer.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([warehouse, inner]) => ({
        warehouseId: warehouse,
        totals: Array.from(inner.values()).sort((a, b) => a.currencyId.localeCompare(b.currencyId)),
      }))
  }

  const warehouseBalances = getWarehouseBalance(products)

  const { data: { items: cashregisters } } = await CashregisterService.get({
    payload: parseGetCashregisters({ pagination: { full: true } }),
  })

  function getCashregisterBalance(cashregisters: CashregisterDTO[]) {
    const result: {
      cashregisterId: string
      totals: { currencyId: string, currencySymbol?: string, currencyName?: string, amount: number }[]
    }[] = []

    for (const cashregister of cashregisters ?? []) {
      const currencyMap = new Map<string, { currencyId: string, currencySymbol?: string, currencyName?: string, amount: number }>()

      for (const account of cashregister.accounts) {
        for (const currency of account.currencies) {
          const id = currency.id
          const row
            = currencyMap.get(id) ?? {
              currencyId: id,
              currencySymbol: currency.symbols?.ru ?? currency.symbols?.en,
              currencyName: currency.names?.ru ?? currency.names?.en,
              amount: 0,
            }
          row.amount += Number(currency.balance) || 0
          currencyMap.set(id, row)
        }
      }

      result.push({
        cashregisterId: cashregister.id,
        totals: Array.from(currencyMap.values()),
      })
    }

    return result
  }

  const cashregisterBalances = getCashregisterBalance(cashregisters)

  const { data: { items: orderStatuses } } = await OrderStatusService.get({
    payload: parseGetOrderStatuses({ pagination: { full: true }, filters: { isLocked: false } }),
  })

  const { data: { items: orders } } = await OrderService.get({
    payload: parseGetOrders({ pagination: { full: true }, filters: { orderStatus: orderStatuses.map(status => status.id) } }),
    user,
  })

  const { data: { items: orderItems } } = await OrderService.getItems({
    payload: parseGetOrderItems({ filters: { order: orders.map(order => order.id), showFullData: true }, pagination: { full: true } }),
    user,
  })

  function getOrdersBalance(orderItems: OrderItemDTOPopulated[]) {
    const outer = new Map<
      string,
      Map<
        string,
        { currencyId: string, currencySymbol?: string, currencyName?: string, quantity: number, amount: number }
      >
    >()

    for (const item of orderItems) {
      const price = Number(item.purchasePrice) || 0
      const currencyId = item.purchaseCurrency?.id ?? 'UNKNOWN'
      const currencySymbol = item.purchaseCurrency?.symbols?.ru ?? item.purchaseCurrency?.symbols?.en
      const currencyName = item.purchaseCurrency?.names?.ru ?? item.purchaseCurrency?.names?.en

      const productId = item.product.id
      const cnt = Number(item.quantity) || 0

      let inner = outer.get(productId)
      if (!inner) {
        inner = new Map()
        outer.set(productId, inner)
      }

      let row = inner.get(currencyId)
      if (!row) {
        row = { currencyId, currencySymbol, currencyName, quantity: 0, amount: 0 }
        inner.set(currencyId, row)
      }

      row.quantity += cnt
      row.amount += cnt * price
    }

    return Array.from(outer.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([productId, inner]) => ({
        productId,
        totals: Array.from(inner.values()).sort((a, b) => a.currencyId.localeCompare(b.currencyId)),
      }))
  }

  const ordersBalances = getOrdersBalance(orderItems)

  function getTotalBalance(
    warehouseBalances: { warehouseId: string, totals: { currencyId: string, amount: number, currencySymbol?: string, currencyName?: string }[] }[],
    // cashregisterBalances: any[],
    // ordersBalances: any[],
  ) {
    const map = new Map<string, { currencyId: string, currencySymbol?: string, currencyName?: string, amount: number }>()

    // склады
    for (const w of warehouseBalances) {
      for (const t of w.totals ?? []) {
        const key = t.currencyId
        const row = map.get(key) ?? {
          currencyId: t.currencyId,
          currencySymbol: t.currencySymbol,
          currencyName: t.currencyName,
          amount: 0,
        }
        row.amount += t.amount || 0
        map.set(key, row)
      }
    }

    // // кассы
    // for (const c of cashregisterBalances ?? []) {
    //   for (const t of c.totals ?? []) {
    //     const key = t.currencyId
    //     const row = map.get(key) ?? {
    //       currencyId: t.currencyId,
    //       currencySymbol: t.currencySymbol,
    //       currencyName: t.currencyName,
    //       amount: 0,
    //     }
    //     row.amount += t.amount || 0
    //     map.set(key, row)
    //   }
    // }

    // // заказы
    // for (const o of ordersBalances ?? []) {
    //   for (const t of o.totals ?? []) {
    //     const key = t.currencyId
    //     const row = map.get(key) ?? {
    //       currencyId: t.currencyId,
    //       currencySymbol: t.currencySymbol,
    //       currencyName: t.currencyName,
    //       amount: 0,
    //     }
    //     row.amount += t.amount || 0
    //     map.set(key, row)
    //   }
    // }

    return Array.from(map.values()).sort((a, b) => a.currencyId.localeCompare(b.currencyId))
  }

  const totalBalances = getTotalBalance(
    warehouseBalances,
    // cashregisterBalances,
    // ordersBalances,
  )

  return {
    status: 'success',
    code: 'BALANCE_FETCHED',
    message: 'Balance fetched',
    data: {
      warehouseBalances,
      cashregisterBalances,
      ordersBalances,
      totalBalances,
    },
  }
}

export async function create({ payload, user }: { payload: CreateBalancesPayload, user: AuthUser }): Promise<CreateBalanceResponse> {
  const { data: { warehouseBalances, cashregisterBalances, totalBalances } } = await getCurrent({ payload: {}, user })

  const newBalance = await BalanceModel.create({
    warehouseBalances,
    cashregisterBalances,
    totalBalances,
    comment: payload.comment,
    createdBy: user.id,
  })

  return {
    status: 'success',
    code: 'BALANCE_CREATED',
    message: 'Balance created',
    data: newBalance,
  }
}

export async function remove({ payload }: { payload: RemoveBalancesPayload }): Promise<RemoveBalancesResponse> {
  const balance = await BalanceRepo.removeById(payload.id)

  if (balance === null)
    throw new HttpError(400, 'Balance not removed', 'BALANCE_NOT_REMOVED')

  return {
    status: 'success',
    code: 'BALANCE_REMOVED',
    message: 'Balance removed',
  }
}
