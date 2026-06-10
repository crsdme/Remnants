import { z } from 'zod'
import { cashregisterAccountSchemaPopulatedDTO } from './cashregister-account.schema'
import { cashregisterSchema } from './cashregister.schema'
import { dateRangeSchema, idSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'
import { currencySchema } from './currency.schema'

export const moneyTransactionSchema = z.object({
  id: idSchema,
  seq: z.number(),
  type: z.string().trim(),
  direction: z.string().trim(),
  account: idSchema,
  amount: z.number(),
  currency: idSchema,
  cashregister: idSchema,
  description: z.string().trim().optional(),
  sourceModel: z.string().trim(),
  sourceId: idSchema,
  confirmed: z.boolean(),
  createdBy: idSchema,
  removedBy: idSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type MoneyTransactionDTO = z.output<typeof moneyTransactionSchema>

export const moneyTransactionPopulatedSchema = z.object({
  id: idSchema,
  seq: z.number(),
  type: z.string().trim(),
  direction: z.string().trim(),
  account: cashregisterAccountSchemaPopulatedDTO,
  amount: z.number(),
  currency: currencySchema,
  cashregister: cashregisterSchema,
  description: z.string().trim().optional(),
  sourceModel: z.string().trim(),
  sourceId: idSchema,
  confirmed: z.boolean(),
  createdBy: idSchema,
  removedBy: idSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type MoneyTransactionPopulatedDTO = z.output<typeof moneyTransactionPopulatedSchema>

export const getMoneyTransactionsSchema = z.object({
  filters: z.object({
    type: z.string().trim().optional(),
    direction: z.string().trim().optional(),
    accountId: z.string().trim().optional(),
    amount: numberFromStringSchema.optional(),
    currency: idSchema.optional(),
    cashregister: idSchema.optional(),
    description: z.string().trim().optional(),
    sourceModel: z.string().trim().optional(),
    sourceId: z.string().trim().optional(),
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
  currency: idSchema,
  amount: z.number(),
  sourceModel: z.enum(['manual', 'cashregister', 'cashregisterAccount', 'order', 'expense', 'procurement']),
  type: z.enum(['income', 'expense', 'procurement']),
  sourceId: idSchema.optional(),
  role: z.string().trim().optional(),
  transferId: idSchema.optional(),
  description: z.string().trim().optional(),
  direction: z.enum(['in', 'out']),
  account: idSchema,
  cashregister: idSchema,
})

export const createMoneyTransactionTransferSchema = z.object({
  currency: idSchema,
  amount: z.number(),
  sourceModel: z.enum(['manual', 'cashregister', 'cashregisterAccount', 'order', 'expense', 'procurement']),
  type: z.enum(['transfer-account', 'transfer-cashregister']),
  sourceId: idSchema.optional(),
  role: z.string().trim().optional(),
  transferId: idSchema.optional(),
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
  sourceId: idSchema.optional(),
  role: z.string().trim().optional(),
  transferId: idSchema.optional(),
  description: z.string().trim().optional(),
})

export const getMoneyTransactionsResponseSchema = responseListSchema(moneyTransactionPopulatedSchema)
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
