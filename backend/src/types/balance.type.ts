import type { z } from 'zod'
import {
  createBalanceSchema,
  getBalanceSchema,
  getCurrentBalanceSchema,
  removeBalanceSchema,
} from '@remnant/shared'

export interface BalanceCurrencyTotalDB {
  currencyId: string
  minorAmount: number
}

export interface BalanceDB {
  _id: string
  seq: number
  totalBalances: BalanceCurrencyTotalDB[]
  cashregisterBalance: {
    cashregisterId: string
    totals: BalanceCurrencyTotalDB[]
  }[]
  warehouseBalance: {
    warehouseId: string
    totals: BalanceCurrencyTotalDB[]
  }[]
  transitBalance: {
    warehouseTransactionId: string
    fromWarehouseId?: string | null
    totals: BalanceCurrencyTotalDB[]
  }[]
  orderedNotReceivedBalance: {
    procurementId: string
    supplierId: string
    totals: BalanceCurrencyTotalDB[]
  }[]
  prepaidBalance: {
    procurementId?: string
    supplierId?: string
    totals: BalanceCurrencyTotalDB[]
  }[]
  receivableBalance: {
    orderId: string
    clientId?: string | null
    totals: BalanceCurrencyTotalDB[]
  }[]
  supplierDebtBalance: {
    procurementId: string
    supplierId: string
    totals: BalanceCurrencyTotalDB[]
  }[]
  comment: string
  createdBy: string
  removed?: boolean
  removedBy?: string | null
  createdAt: Date
  updatedAt: Date
}

export type GetBalancesPayload = z.output<typeof getBalanceSchema>
export function parseGetBalances(x: unknown): GetBalancesPayload {
  return getBalanceSchema.parse(x)
}

export type CreateBalancesPayload = z.output<typeof createBalanceSchema>
export function parseCreateBalances(x: unknown): CreateBalancesPayload {
  return createBalanceSchema.parse(x)
}

export type GetCurrentBalancePayload = z.output<typeof getCurrentBalanceSchema>
export function parseGetCurrentBalance(x: unknown): GetCurrentBalancePayload {
  return getCurrentBalanceSchema.parse(x)
}

export type RemoveBalancesPayload = z.output<typeof removeBalanceSchema>
export function parseRemoveBalances(x: unknown): RemoveBalancesPayload {
  return removeBalanceSchema.parse(x)
}

export interface GetBalancesRepoResult {
  items: BalanceDB[]
  total: number
  page: number
  pageSize: number
}

export interface CreateBalanceRepoPayload {
  totalBalances: BalanceCurrencyTotalDB[]
  cashregisterBalance: BalanceDB['cashregisterBalance']
  warehouseBalance: BalanceDB['warehouseBalance']
  transitBalance: BalanceDB['transitBalance']
  orderedNotReceivedBalance: BalanceDB['orderedNotReceivedBalance']
  prepaidBalance: BalanceDB['prepaidBalance']
  receivableBalance: BalanceDB['receivableBalance']
  supplierDebtBalance: BalanceDB['supplierDebtBalance']
  comment?: string
  createdBy: string
}
