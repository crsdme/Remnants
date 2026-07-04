import { idSchema, languageStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const moneyTransactionSchema = z.object({
  _id: z.string(),
  seq: z.number(),
  type: z.enum(['income', 'cancelled', 'expense', 'transfer', 'refund', 'investment', 'purchase', 'procurement']),
  direction: z.enum(['in', 'out']),
  account: z.string(),
  minorAmount: z.number(),
  currencyId: z.string(),
  cashregisterId: z.string(),
  description: z.string().optional(),
  sourceModel: z.string(),
  sourceId: z.string(),
  createdBy: z.string(),
  removedBy: z.string().optional(),
  removed: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const moneyTransactionPopulatedSchema = z.object({
  id: z.string(),
  seq: z.number(),
  type: z.enum(['income', 'cancelled', 'expense', 'transfer', 'refund', 'investment', 'purchase', 'procurement']),
  direction: z.enum(['in', 'out']),
  account: z.object({
    id: z.string(),
    names: languageStringSchema,
  }),
  minorAmount: z.number(),
  currency: z.object({
    id: z.string(),
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: z.number(),
  }),
  cashregister: z.object({
    id: z.string(),
    names: languageStringSchema,
    priority: z.number(),
  }),
  description: z.string().optional(),
  sourceModel: z.enum(['manual', 'cashregister', 'cashregisterAccount', 'order', 'expense', 'procurement']),
  sourceId: idSchema.optional(),
  role: z.string().optional(),
  transferId: z.string().optional(),
  confirmed: z.boolean(),
  createdBy: z.string(),
  removedBy: z.string().optional(),
  removed: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const createMoneyTransactionRepoSchema = z.object({
  type: z.enum(['income', 'cancelled', 'expense', 'transfer', 'refund', 'investment', 'purchase', 'procurement']),
  currencyId: z.string(),
  minorAmount: z.number(),
  direction: z.enum(['in', 'out']),
  accountId: z.string(),
  cashregisterId: z.string(),
  sourceModel: z.enum(['manual', 'cashregister', 'cashregisterAccount', 'order', 'expense', 'procurement']),
  sourceId: z.string().optional(),
  role: z.string().optional(),
  transferId: z.string().optional(),
  description: z.string().optional(),
})
