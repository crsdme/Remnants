import type * as BalanceTypes from '../types/balance.type'
import type { User } from '../types/user.type'
import { BalanceModel } from '../models/balance.model'
import { HttpError } from '../utils/httpError'
import * as CashregisterService from './cashregister.service'
import * as ProductService from './product.service'

export async function get(payload: BalanceTypes.getBalancesParams): Promise<BalanceTypes.getBalancesResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const balances = await BalanceModel.find(payload.filters ?? {})
    .sort({ createdAt: 1 })
    .limit(pageSize)
    .skip((current - 1) * pageSize)

  return {
    status: 'success',
    code: 'BALANCE_FETCHED',
    message: 'Balance fetched',
    balances,
  }
}

export async function getCurrent(_payload: BalanceTypes.getCurrentBalanceParams, user?: User): Promise<BalanceTypes.getCurrentBalanceResult> {
  const { products } = await ProductService.get(
    {
      pagination: { full: true },
    },
    user,
  )

  function getWarehouseBalance(products: any) {
    const outer = new Map<
      string,
      Map<
        string,
        { currencyId: string, currencySymbol?: string, currencyName?: string, quantity: number, amount: number }
      >
    >()

    for (const p of products ?? []) {
      const price = Number(p.purchasePrice) || 0
      const currencyId = p.currency?.id ?? 'UNKNOWN'
      const currencySymbol = p.currency?.symbols?.ru ?? p.currency?.symbols?.en
      const currencyName = p.currency?.names?.ru ?? p.currency?.names?.en

      for (const q of p.quantity ?? []) {
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

  const { cashregisters } = await CashregisterService.get({
    pagination: { full: true },
  })

  function getCashregisterBalance(cashregisters: any) {
    const result: {
      cashregisterId: string
      totals: { currencyId: string, currencySymbol?: string, currencyName?: string, amount: number }[]
    }[] = []

    for (const reg of cashregisters ?? []) {
      const currencyMap = new Map<string, { currencyId: string, currencySymbol?: string, currencyName?: string, amount: number }>()

      for (const acc of reg.accounts ?? []) {
        for (const c of acc.currencies ?? []) {
          const id = c.id ?? 'UNKNOWN'
          const row
            = currencyMap.get(id) ?? {
              currencyId: id,
              currencySymbol: c.symbols?.ru ?? c.symbols?.en,
              currencyName: c.names?.ru ?? c.names?.en,
              amount: 0,
            }
          row.amount += Number(c.balance) || 0
          currencyMap.set(id, row)
        }
      }

      result.push({
        cashregisterId: reg.id,
        totals: Array.from(currencyMap.values()),
      })
    }

    return result
  }

  const cashregisterBalances = getCashregisterBalance(cashregisters)

  function getTotalBalance(warehouseBalances: any[], cashregisterBalances: any[]) {
    const map = new Map<string, { currencyId: string, currencySymbol?: string, currencyName?: string, amount: number }>()

    // склады
    for (const w of warehouseBalances ?? []) {
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

    // кассы
    for (const c of cashregisterBalances ?? []) {
      for (const t of c.totals ?? []) {
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

    return Array.from(map.values()).sort((a, b) => a.currencyId.localeCompare(b.currencyId))
  }

  const totalBalances = getTotalBalance(warehouseBalances, cashregisterBalances)

  const balance = {
    warehouseBalances,
    cashregisterBalances,
    totalBalances,
  }

  return {
    status: 'success',
    code: 'BALANCE_FETCHED',
    message: 'Balance fetched',
    balance,
  }
}

export async function create(payload: BalanceTypes.createBalanceParams, user: User): Promise<BalanceTypes.createBalanceResult> {
  const { balance } = await getCurrent({}, user)

  const newBalance = await BalanceModel.create({
    warehouseBalances: balance.warehouseBalances,
    cashregisterBalances: balance.cashregisterBalances,
    totalBalances: balance.totalBalances,
    comment: payload.comment,
    createdBy: user.id,
  })

  return {
    status: 'success',
    code: 'BALANCE_CREATED',
    message: 'Balance created',
    balance: newBalance,
  }
}

export async function remove(id: string, user: User): Promise<BalanceTypes.removeBalancesResult> {
  const balance = await BalanceModel.findByIdAndUpdate(id, { removedBy: user.id, removed: true }, { new: true })

  if (!balance) {
    throw new HttpError(400, 'Balance not removed', 'BALANCE_NOT_REMOVED')
  }

  return {
    status: 'success',
    code: 'BALANCE_REMOVED',
    message: 'Balance removed',
    balance,
  }
}
