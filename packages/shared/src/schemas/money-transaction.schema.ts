import { z } from 'zod'
import { dateRangeSchema, idSchema, idSchemaOptional, languageStringSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'

export const moneyTransactionSchema = z.object({
  id: idSchema,
  seq: z.number(),
  type: z.enum(['income', 'cancelled', 'expense', 'transfer', 'refund', 'investment', 'purchase', 'procurement']),
  direction: z.enum(['in', 'out']),
  account: z.object({
    id: idSchema,
    names: languageStringSchema,
  }),
  amount: z.number(),
  currency: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: z.number(),
  }),
  cashregister: z.object({
    id: idSchema,
    names: languageStringSchema,
    priority: z.number(),
  }),
  description: z.string().trim().optional(),
  sourceModel: z.string().trim(),
  confirmed: z.boolean(),
  sourceId: idSchemaOptional,
  createdBy: idSchemaOptional,
  removedBy: idSchemaOptional,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type MoneyTransactionDTO = z.output<typeof moneyTransactionSchema>

export const getMoneyTransactionsSchema = z.object({
  filters: z.object({
    type: z.string().trim().optional(),
    direction: z.string().trim().optional(),
    accountId: idSchemaOptional,
    amount: numberFromStringSchema.optional(),
    currency: idSchemaOptional,
    cashregister: idSchemaOptional,
    description: z.string().trim().optional(),
    sourceModel: z.string().trim().optional(),
    sourceId: idSchemaOptional,
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    type: sorterParamsSchema.optional(),
    direction: sorterParamsSchema.optional(),
    accountId: sorterParamsSchema.optional(),
    sourceModel: sorterParamsSchema.optional(),
    sourceId: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetMoneyTransactionsRequest = z.input<typeof getMoneyTransactionsSchema>

export const createMoneyTransactionSchema = z.object({
  currencyId: idSchema,
  amount: z.number(),
  sourceModel: z.enum(['manual', 'cashregister', 'cashregisterAccount', 'order', 'expense', 'procurement']),
  type: z.enum(['income', 'expense', 'procurement']),
  sourceId: idSchemaOptional,
  role: z.string().trim().optional(),
  transferId: idSchemaOptional,
  description: z.string().trim().optional(),
  direction: z.enum(['in', 'out']),
  accountId: idSchema,
  cashregisterId: idSchema,
})

export const createMoneyTransactionTransferSchema = z.object({
  currencyId: idSchema,
  amount: z.number(),
  sourceModel: z.enum(['manual', 'cashregister', 'cashregisterAccount', 'order', 'expense', 'procurement']),
  type: z.enum(['transfer-account', 'transfer-cashregister']),
  sourceId: idSchemaOptional,
  role: z.string().trim().optional(),
  transferId: idSchemaOptional,
  description: z.string().trim().optional(),
  accountFrom: idSchema,
  accountTo: idSchema,
  cashregisterFrom: idSchema,
  cashregisterTo: idSchema,
})

export type CreateMoneyTransactionRequest = z.input<typeof createMoneyTransactionSchema>
export type CreateMoneyTransactionTransferRequest = z.input<typeof createMoneyTransactionTransferSchema>

export const createMoneyTransactionRepoSchema = z.object({
  type: z.enum(['income', 'transfer', 'expense', 'procurement']),
  currencyId: idSchema,
  amount: z.number(),
  direction: z.enum(['in', 'out']),
  accountId: idSchema,
  cashregisterId: idSchema,
  sourceModel: z.enum(['manual', 'cashregister', 'cashregisterAccount', 'order', 'expense', 'procurement']),
  sourceId: idSchemaOptional,
  role: z.string().trim().optional(),
  transferId: idSchemaOptional,
  description: z.string().trim().optional(),
})

export const getMoneyTransactionsResponseSchema = responseListSchema(moneyTransactionSchema)
export type GetMoneyTransactionsResponse = z.output<typeof getMoneyTransactionsResponseSchema>

export const createMoneyTransactionResponseSchema = responseItemSchema(moneyTransactionSchema)
export type CreateMoneyTransactionResponse = z.output<typeof createMoneyTransactionResponseSchema>

export const createMoneyTransactionTransferResponseSchema = responseSchema.extend({
  data: z.object({
    transferOut: moneyTransactionSchema,
    transferIn: moneyTransactionSchema,
  }),
})
export type CreateMoneyTransactionTransferResponse = z.output<typeof createMoneyTransactionTransferResponseSchema>

export const removeMoneyTransactionsResponseSchema = responseSchema
export type RemoveMoneyTransactionsResponse = z.output<typeof removeMoneyTransactionsResponseSchema>
