import { z } from 'zod'
import {
  dateRangeSchema,
  idSchema,
  idSchemaOptional,
  languageStringSchema,
  numberFromStringSchema,
  paginationSchema,
  responseListSchema,
  responseSchema,
  sorterParamsSchema,
} from './common'

const expenseFileSchema = z.object({
  id: z.string(),
  filename: z.string(),
  name: z.string(),
  type: z.string(),
  path: z.string(),
})

const expenseFileInputSchema = z.object({
  id: z.string().optional(),
  filename: z.string().optional().default(''),
  name: z.string(),
  type: z.string(),
  path: z.string().optional().default(''),
  isNew: z.boolean().optional().default(false),
})

const uploadedFilesIdsSchema = z.preprocess(
  (val) => {
    if (val === undefined || val === null || val === '')
      return undefined
    return Array.isArray(val) ? val : [val]
  },
  z.array(z.string()).optional(),
)

export const expenseDTOSchema = z.object({
  id: idSchema,
  seq: numberFromStringSchema,
  amount: numberFromStringSchema,
  currency: idSchema,
  cashregister: idSchema,
  cashregisterAccount: idSchema,
  categories: z.array(idSchema),
  sourceModel: z.string().trim().optional(),
  sourceId: idSchemaOptional,
  type: z.string().trim(),
  comment: z.string().optional(),
  files: z.array(expenseFileSchema).optional().default([]),
  createdBy: idSchemaOptional,
  removedBy: idSchemaOptional,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ExpenseDTO = z.output<typeof expenseDTOSchema>

export const expensePopulatedSchema = expenseDTOSchema.extend({
  currency: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: numberFromStringSchema,
  }),
  cashregister: z.object({
    id: idSchema,
    names: languageStringSchema,
  }),
  cashregisterAccount: z.object({
    id: idSchema,
    names: languageStringSchema,
  }),
  categories: z.array(z.object({
    id: idSchema,
    names: languageStringSchema,
  })),
})

export type ExpensePopulatedDTO = z.output<typeof expensePopulatedSchema>

export const getExpensesSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    seq: numberFromStringSchema.optional(),
    amount: numberFromStringSchema.optional(),
    currency: idSchemaOptional,
    cashregister: idSchemaOptional,
    cashregisterAccount: idSchemaOptional,
    category: idSchemaOptional,
    sourceModel: z.string().trim().optional(),
    sourceId: idSchemaOptional,
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

const commentSchema = z.preprocess(
  (val) => {
    if (val === undefined || val === null || val === '')
      return undefined
    return String(val)
  },
  z.string().optional(),
)

export const createExpenseSchema = z.object({
  amount: numberFromStringSchema,
  currency: idSchema,
  cashregister: idSchema,
  cashregisterAccount: idSchema,
  categories: z.array(idSchema),
  type: z.string().trim(),
  comment: commentSchema,
  files: z.array(expenseFileInputSchema).optional().default([]),
  uploadedFilesIds: uploadedFilesIdsSchema,
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
  comment: commentSchema,
  files: z.array(expenseFileInputSchema).optional().default([]),
  uploadedFilesIds: uploadedFilesIdsSchema,
})

export type EditExpenseRequest = z.input<typeof editExpenseSchema>

export const removeExpensesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveExpensesRequest = z.input<typeof removeExpensesSchema>

export const getExpensesResponseSchema = responseListSchema(expensePopulatedSchema)
export type GetExpensesResponse = z.output<typeof getExpensesResponseSchema>

export const createExpenseResponseSchema = responseSchema
export type CreateExpenseResponse = z.output<typeof createExpenseResponseSchema>

export const editExpenseResponseSchema = responseSchema
export type EditExpenseResponse = z.output<typeof editExpenseResponseSchema>

export const removeExpensesResponseSchema = responseSchema
export type RemoveExpensesResponse = z.output<typeof removeExpensesResponseSchema>
