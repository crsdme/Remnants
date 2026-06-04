import type {
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface Balance {
  _id: string
  seq: number
  warehouseBalance: {
    warehouseId: string
    totals: {
      currencyId: string
      amount: number
    }[]
  }[]
  cashregisterBalance: {
    cashregisterId: string
    totals: {
      currencyId: string
      amount: number
    }[]
  }[]
  comment: string
}

export type GetBalancesResponse = ResponseList<Balance>

export type GetCurrentBalanceResponse = ResponseItem<{
  warehouseBalances: { warehouseId: string, totals: { currencyId: string, amount: number }[] }[]
  cashregisterBalances: { cashregisterId: string, totals: { currencyId: string, amount: number }[] }[]
  ordersBalances: { productId: string, totals: { currencyId: string, amount: number }[] }[]
  totalBalances: { currencyId: string, amount: number }[]
}>

export type CreateBalanceResponse = ResponseItem<Balance>

export type RemoveBalancesResponse = Response
