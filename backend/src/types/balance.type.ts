import type {
  BalanceDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import {
  createBalanceSchema,
  getBalanceSchema,
  getCurrentBalanceSchema,
  removeBalanceSchema,
} from '@remnant/shared'

export interface BalanceDB {
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

export interface GetBalancesRepoResult { items: BalanceDTO[], total: number, page: number, pageSize: number }
