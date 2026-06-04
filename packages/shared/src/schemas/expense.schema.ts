import { z } from 'zod'
import { dateRangeSchema, idSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

export const getExpensesSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    amount: numberFromStringSchema.optional(),
    currency: idSchema.optional(),
    cashregister: idSchema.optional(),
    cashregisterAccount: idSchema.optional(),
    category: idSchema.optional(),
    sourceModel: z.string().trim().optional(),
    sourceId: idSchema.optional(),
    type: z.string().trim().optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    amount: sorterParamsSchema.optional(),
    currency: sorterParamsSchema.optional(),
    cashregister: sorterParamsSchema.optional(),
    cashregisterAccount: sorterParamsSchema.optional(),
    category: sorterParamsSchema.optional(),
    sourceModel: sorterParamsSchema.optional(),
    sourceId: sorterParamsSchema.optional(),
    type: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetExpensesRequest = z.input<typeof getExpensesSchema>

export const createExpenseSchema = z.object({
  amount: numberFromStringSchema,
  currency: idSchema,
  cashregister: idSchema,
  cashregisterAccount: idSchema,
  categories: z.array(idSchema),
  type: z.string().trim(),
  comment: z.string().optional(),
})

export type CreateExpenseRequest = z.input<typeof createExpenseSchema>

export const editExpenseSchema = z.object({
  id: idSchema,
  amount: numberFromStringSchema,
  currency: idSchema,
  cashregister: idSchema,
  cashregisterAccount: idSchema,
  categories: z.array(idSchema),
  type: z.string().trim(),
  comment: z.string().optional(),
})

export type EditExpenseRequest = z.input<typeof editExpenseSchema>

export const removeExpensesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveExpensesRequest = z.input<typeof removeExpensesSchema>
