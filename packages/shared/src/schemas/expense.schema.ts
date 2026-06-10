import { z } from 'zod'
import { cashregisterAccountSchemaPopulatedDTO } from './cashregister-account.schema'
import { cashregisterSchema } from './cashregister.schema'
import { dateRangeSchema, idSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'
import { currencySchema } from './currency.schema'
import { expenseCategorySchema } from './expense-category.schema'

export const expenseSchema = z.object({
  id: idSchema,
  seq: numberFromStringSchema,
  amount: numberFromStringSchema,
  currency: idSchema,
  cashregister: idSchema,
  cashregisterAccount: idSchema,
  categories: z.array(idSchema),
  sourceModel: z.string().trim(),
  sourceId: idSchema,
  type: z.string().trim(),
  comment: z.string().optional(),
  createdBy: idSchema,
  removedBy: idSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ExpenseDTO = z.output<typeof expenseSchema>

export const expensePopulatedSchema = z.object({
  ...expenseSchema.shape,
  currency: currencySchema,
  cashregister: cashregisterSchema,
  cashregisterAccount: cashregisterAccountSchemaPopulatedDTO,
  categories: z.array(expenseCategorySchema),
})

export type ExpensePopulatedDTO = z.output<typeof expensePopulatedSchema>

export const getExpensesSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    seq: numberFromStringSchema.optional(),
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

export const getExpensesResponseSchema = responseListSchema(expensePopulatedSchema)
export type GetExpensesResponse = z.output<typeof getExpensesResponseSchema>

export const createExpenseResponseSchema = responseItemSchema(expenseSchema)
export type CreateExpenseResponse = z.output<typeof createExpenseResponseSchema>

export const editExpenseResponseSchema = responseItemSchema(expenseSchema)
export type EditExpenseResponse = z.output<typeof editExpenseResponseSchema>

export const removeExpensesResponseSchema = responseSchema
export type RemoveExpensesResponse = z.output<typeof removeExpensesResponseSchema>
