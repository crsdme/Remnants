import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

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

const baseCreateMoneyTransactionSchema = z.object({
  currency: idSchema,
  amount: z.number(),
  sourceModel: z.enum(['manual', 'cashregister', 'cashregisterAccount']),
  sourceId: idSchema.optional(),
  role: z.string().trim().optional(),
  transferId: idSchema.optional(),
  description: z.string().trim().optional(),
})

const singleTransactionSchema = baseCreateMoneyTransactionSchema.extend({
  type: z.literal('income'),
  direction: z.enum(['in', 'out']),
  account: idSchema,
  cashregister: idSchema,
})

const transferAccountTransactionSchema = baseCreateMoneyTransactionSchema.extend({
  type: z.literal('transfer-account'),
  accountFrom: idSchema,
  accountTo: idSchema,
  cashregister: idSchema,
})

const transferCashregisterTransactionSchema = baseCreateMoneyTransactionSchema.extend({
  type: z.literal('transfer-cashregister'),
  accountFrom: idSchema,
  accountTo: idSchema,
  cashregisterFrom: idSchema,
  cashregisterTo: idSchema,
})

export const createMoneyTransactionSchema = z.discriminatedUnion('type', [
  singleTransactionSchema,
  transferAccountTransactionSchema,
  transferCashregisterTransactionSchema,
])

export const removeMoneyTransactionsSchema = z.object({
  ids: z.array(idSchema).min(1),
})
