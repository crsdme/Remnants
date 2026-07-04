import type { createMoneyTransactionSchema, createMoneyTransactionTransferSchema, getMoneyTransactionsSchema, moneyTransactionSchema } from '@remnant/shared'
import type { z } from 'zod'

import type {
  moneyTransactionPopulatedSchema,
} from '@/schemas'
import {
  createMoneyTransactionRepoSchema,
} from '@/schemas'

export type MoneyTransactionDB = z.output<typeof moneyTransactionSchema>

export type MoneyTransactionPopulated = z.output<typeof moneyTransactionPopulatedSchema>

export type GetMoneyTransactionsPayload = z.output<typeof getMoneyTransactionsSchema>

export type CreateMoneyTransactionsPayload = z.output<typeof createMoneyTransactionSchema>

export type CreateMoneyTransactionTransferPayload = z.output<typeof createMoneyTransactionTransferSchema>

export type GetMoneyTransactionsRepoPayload = GetMoneyTransactionsPayload
export interface GetMoneyTransactionsRepoResult { items: MoneyTransactionPopulated[], total: number, page: number, pageSize: number }

export type CreateMoneyTransactionsRepoPayload = z.output<typeof createMoneyTransactionRepoSchema>
export function parseCreateMoneyTransactionsRepo(x: unknown): CreateMoneyTransactionsRepoPayload {
  return (createMoneyTransactionRepoSchema as z.ZodType<CreateMoneyTransactionsRepoPayload>).parse(x)
}
