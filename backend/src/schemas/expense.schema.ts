import { idSchema, idSchemaOptional, languageStringSchema, minorSchema, numberFromStringSchema } from '@remnant/shared'
import { z } from 'zod'

export const expenseDBSchema = z.object({
  _id: idSchema,
  seq: numberFromStringSchema,
  minorAmount: minorSchema,
  currencyId: idSchema,
  cashregisterId: idSchema,
  cashregisterAccountId: idSchema,
  categoryIds: z.array(idSchema),
  sourceModel: z.enum(['manual', 'cashregister', 'cashregisterAccount', 'order', 'expense', 'procurement']),
  sourceId: idSchema,
  type: z.string().trim(),
  comment: z.string().optional(),
  files: z.array(z.object({
    path: z.string(),
    filename: z.string(),
    name: z.string(),
    type: z.string(),
  })).optional().default([]),
  createdBy: idSchema,
  removedBy: idSchema,
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const expenseDBPopulatedSchema = expenseDBSchema.omit({
  _id: true,
  currencyId: true,
  cashregisterId: true,
  cashregisterAccountId: true,
  categoryIds: true,
}).extend({
  id: idSchema,
  currency: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: z.number(),
  }),
  cashregister: z.object({
    id: idSchema,
    names: languageStringSchema,
    priority: z.number().optional(),
    active: z.boolean().optional(),
  }),
  cashregisterAccount: z.object({
    id: idSchema,
    names: languageStringSchema,
    priority: z.number().optional(),
    active: z.boolean().optional(),
  }),
  categories: z.array(z.object({
    id: idSchema,
    names: languageStringSchema,
  })),
  sourceModel: z.enum(['manual', 'cashregister', 'cashregisterAccount', 'order', 'expense', 'procurement']).optional(),
  sourceId: idSchemaOptional,
  createdBy: idSchemaOptional,
  removedBy: idSchemaOptional,
  removed: z.boolean().optional(),
})

export const createExpenseRepoSchema = z.object({
  minorAmount: minorSchema,
  currencyId: idSchema,
  cashregisterId: idSchema,
  cashregisterAccountId: idSchema,
  categoryIds: z.array(idSchema),
  sourceModel: z.enum(['manual', 'cashregister', 'cashregisterAccount', 'order', 'expense', 'procurement']).optional(),
  sourceId: idSchemaOptional,
  type: z.string().trim(),
  comment: z.string().optional(),
  files: z.array(z.object({
    path: z.string(),
    filename: z.string(),
    name: z.string(),
    type: z.string(),
  })).optional().default([]),
  createdBy: idSchemaOptional,
})

export const editExpenseRepoSchema = z.object({
  minorAmount: minorSchema.optional(),
  currencyId: idSchemaOptional,
  cashregisterId: idSchemaOptional,
  cashregisterAccountId: idSchemaOptional,
  categoryIds: z.array(idSchema).optional(),
  sourceModel: z.enum(['manual', 'cashregister', 'cashregisterAccount', 'order', 'expense', 'procurement']).optional(),
  sourceId: idSchemaOptional,
  type: z.string().trim().optional(),
  comment: z.string().optional(),
  files: z.array(z.object({
    path: z.string(),
    filename: z.string(),
    name: z.string(),
    type: z.string(),
  })).optional(),
})
