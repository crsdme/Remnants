import { idSchema, languageStringSchema, numberFromStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const expenseDBSchema = z.object({
  _id: idSchema,
  seq: numberFromStringSchema,
  minorAmount: numberFromStringSchema,
  currencyId: idSchema,
  cashregisterId: idSchema,
  cashregisterAccountId: idSchema,
  categoryIds: z.array(idSchema),
  sourceModel: z.enum(['manual', 'cashregister', 'cashregisterAccount', 'order', 'expense', 'procurement']),
  sourceId: idSchema,
  type: z.string().trim(),
  comment: z.string().optional(),
  createdBy: idSchema,
  removedBy: idSchema,
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const expenseDBPopulatedSchema = expenseDBSchema.omit({
  currencyId: true,
  cashregisterId: true,
  cashregisterAccountId: true,
  categoryIds: true,
}).extend({
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
    active: z.boolean(),
  }),
  cashregisterAccount: z.object({
    id: idSchema,
    names: languageStringSchema,
    priority: z.number(),
    active: z.boolean(),
  }),
  categories: z.array(z.object({
    id: idSchema,
    names: languageStringSchema,
  })),
})

export const createExpenseRepoSchema = z.object({
  minorAmount: numberFromStringSchema,
  currencyId: idSchema,
  cashregisterId: idSchema,
  cashregisterAccountId: idSchema,
  categoryIds: z.array(idSchema),
  sourceModel: z.enum(['manual', 'cashregister', 'cashregisterAccount', 'order', 'expense', 'procurement']),
  sourceId: idSchema,
  type: z.string().trim(),
  comment: z.string().optional(),
  createdBy: idSchema.optional(),
})

export const editExpenseRepoSchema = z.object({
  minorAmount: numberFromStringSchema.optional(),
  currencyId: idSchema.optional(),
  cashregisterId: idSchema.optional(),
  cashregisterAccountId: idSchema.optional(),
  categoryIds: z.array(idSchema).optional(),
  sourceModel: z.enum(['manual', 'cashregister', 'cashregisterAccount', 'order', 'expense', 'procurement']).optional(),
  sourceId: idSchema.optional(),
  type: z.string().trim().optional(),
  comment: z.string().optional(),
})
