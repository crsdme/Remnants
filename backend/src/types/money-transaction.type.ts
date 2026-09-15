import type { cancelMoneyTransactionSchema, createMoneyTransactionSchema, createMoneyTransactionTransferSchema, getMoneyTransactionsSchema, moneyTransactionSchema, receiveMoneyTransactionSchema } from '@remnant/shared'
import type { z } from 'zod'

import type {
  createMoneyTransactionRepoSchema,
  moneyTransactionPopulatedSchema,
} from '@/schemas'

export type MoneyTransactionDB = z.output<typeof moneyTransactionSchema>

export type MoneyTransactionPopulated = z.output<typeof moneyTransactionPopulatedSchema>

export type GetMoneyTransactionsPayload = z.output<typeof getMoneyTransactionsSchema>

export type CreateMoneyTransactionsPayload = z.output<typeof createMoneyTransactionSchema>

export type CreateMoneyTransactionTransferPayload = z.output<typeof createMoneyTransactionTransferSchema>

export type ReceiveMoneyTransactionPayload = z.output<typeof receiveMoneyTransactionSchema>

export type CancelMoneyTransactionPayload = z.output<typeof cancelMoneyTransactionSchema>

export type GetMoneyTransactionsRepoPayload = GetMoneyTransactionsPayload
export interface GetMoneyTransactionsRepoResult { items: MoneyTransactionPopulated[], total: number, page: number, pageSize: number }

export type CreateMoneyTransactionsRepoPayload = z.output<typeof createMoneyTransactionRepoSchema>
