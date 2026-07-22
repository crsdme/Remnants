import { idSchema, idSchemaOptional, languageStringSchema, minorNumberSchema } from '@remnant/shared'
import { z } from 'zod'

export const moneyTransactionSchema = z.object({
  _id: idSchema,
  seq: z.number(),
  type: z.enum(['income', 'cancelled', 'expense', 'transfer', 'refund', 'investment', 'purchase', 'procurement']),
  direction: z.enum(['in', 'out']),
  account: idSchema,
  minorAmount: minorNumberSchema,
  currencyId: idSchema,
  cashregisterId: idSchema,
  description: z.string().optional(),
  sourceModel: z.string(),
  sourceId: idSchema,
  createdBy: idSchema,
  removedBy: idSchemaOptional,
  removed: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const moneyTransactionPopulatedSchema = z.object({
  id: idSchema,
  seq: z.number(),
  type: z.enum(['income', 'cancelled', 'expense', 'transfer', 'refund', 'investment', 'purchase', 'procurement']),
  direction: z.enum(['in', 'out']),
  account: z.object({
    id: idSchema,
    names: languageStringSchema,
  }),
  minorAmount: minorNumberSchema,
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
  description: z.string().optional(),
  sourceModel: z.enum(['manual', 'cashregister', 'cashregisterAccount', 'order', 'expense', 'procurement']),
  sourceId: idSchemaOptional,
  role: z.string().optional(),
  transferId: idSchemaOptional,
  confirmed: z.boolean(),
  createdBy: idSchema,
  removedBy: idSchemaOptional,
  removed: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const createMoneyTransactionRepoSchema = z.object({
  type: z.enum(['income', 'cancelled', 'expense', 'transfer', 'refund', 'investment', 'purchase', 'procurement']),
  currencyId: idSchema,
  minorAmount: minorNumberSchema,
  direction: z.enum(['in', 'out']),
  accountId: idSchema,
  cashregisterId: idSchema,
  sourceModel: z.enum(['manual', 'cashregister', 'cashregisterAccount', 'order', 'expense', 'procurement']),
  sourceId: idSchemaOptional,
  role: z.string().optional(),
  transferId: idSchemaOptional,
  description: z.string().optional(),
})
