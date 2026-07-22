import type {
  ExpenseCategoryDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import type { expenseCategoryDBSchema } from '../schemas'
import {
  createExpenseCategorySchema,
  editExpenseCategorySchema,
  getExpenseCategoriesSchema,
  removeExpenseCategoriesSchema,
} from '@remnant/shared'

export type ExpenseCategoryDB = z.infer<typeof expenseCategoryDBSchema>

export type GetExpenseCategoriesPayload = z.output<typeof getExpenseCategoriesSchema>
export function parseGetExpenseCategories(x: unknown): GetExpenseCategoriesPayload {
  return getExpenseCategoriesSchema.parse(x)
}

export type CreateExpenseCategoriesPayload = z.output<typeof createExpenseCategorySchema>
export function parseCreateExpenseCategories(x: unknown): CreateExpenseCategoriesPayload {
  return createExpenseCategorySchema.parse(x)
}

export type EditExpenseCategoriesPayload = z.output<typeof editExpenseCategorySchema>
export function parseEditExpenseCategories(x: unknown): EditExpenseCategoriesPayload {
  return editExpenseCategorySchema.parse(x)
}

export type RemoveExpenseCategoriesPayload = z.output<typeof removeExpenseCategoriesSchema>
export function parseRemoveExpenseCategories(x: unknown): RemoveExpenseCategoriesPayload {
  return removeExpenseCategoriesSchema.parse(x)
}

export type GetExpenseCategoriesRepoPayload = GetExpenseCategoriesPayload
export interface GetExpenseCategoriesRepoResult { items: ExpenseCategoryDTO[], total: number, page: number, pageSize: number }

export type CreateExpenseCategoriesRepoPayload = CreateExpenseCategoriesPayload

export type EditExpenseCategoriesRepoPayload = EditExpenseCategoriesPayload
