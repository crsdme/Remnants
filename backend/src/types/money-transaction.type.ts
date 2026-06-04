import type { MoneyTransactionDTO } from '@remnant/shared'
import type { z } from 'zod'
import {
  createMoneyTransactionRepoSchema,
  createMoneyTransactionSchema,
  getMoneyTransactionsSchema,
} from '@remnant/shared'

export interface MoneyTransactionDB {
  _id: string
  seq: number
  type: string
  direction: string
  account: string
  minorAmount: number
  currency: string
  cashregister: string
  description: string
  sourceModel: string
  sourceId: string
  createdBy: string
  removedBy: string
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetMoneyTransactionsPayload = z.output<typeof getMoneyTransactionsSchema>
export function parseGetMoneyTransactions(x: unknown): GetMoneyTransactionsPayload {
  return (getMoneyTransactionsSchema as z.ZodType<GetMoneyTransactionsPayload>).parse(x)
}

export type CreateMoneyTransactionsPayload = z.output<typeof createMoneyTransactionSchema>
export function parseCreateMoneyTransactions(x: unknown): CreateMoneyTransactionsPayload {
  return (createMoneyTransactionSchema as z.ZodType<CreateMoneyTransactionsPayload>).parse(x)
}

export type GetMoneyTransactionsRepoPayload = GetMoneyTransactionsPayload
export interface GetMoneyTransactionsRepoResult { items: MoneyTransactionDTO[], total: number, page: number, pageSize: number }

export type CreateMoneyTransactionsRepoPayload = z.output<typeof createMoneyTransactionRepoSchema>
export function parseCreateMoneyTransactionsRepo(x: unknown): CreateMoneyTransactionsRepoPayload {
  return (createMoneyTransactionRepoSchema as z.ZodType<CreateMoneyTransactionsRepoPayload>).parse(x)
}
