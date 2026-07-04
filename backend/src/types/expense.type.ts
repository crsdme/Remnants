import type { z } from 'zod'
import type {
  createExpenseRepoSchema,
  editExpenseRepoSchema,
  expenseDBPopulatedSchema,
  expenseDBSchema,
} from '../schemas'
import {
  createExpenseSchema,
  editExpenseSchema,
  getExpensesSchema,
  removeExpensesSchema,
} from '@remnant/shared'

export type ExpenseDB = z.infer<typeof expenseDBSchema>

export type ExpenseDBPopulated = z.infer<typeof expenseDBPopulatedSchema>

export type GetExpensesPayload = z.output<typeof getExpensesSchema>
export function parseGetExpenses(x: unknown): GetExpensesPayload {
  return getExpensesSchema.parse(x)
}

export type CreateExpensePayload = z.output<typeof createExpenseSchema>
export function parseCreateExpense(x: unknown): CreateExpensePayload {
  return createExpenseSchema.parse(x)
}

export type EditExpensePayload = z.output<typeof editExpenseSchema>
export function parseEditExpense(x: unknown): EditExpensePayload {
  return editExpenseSchema.parse(x)
}

export type RemoveExpensesPayload = z.output<typeof removeExpensesSchema>
export function parseRemoveExpenses(x: unknown): RemoveExpensesPayload {
  return removeExpensesSchema.parse(x)
}

export type GetExpensesRepoPayload = GetExpensesPayload
export interface GetExpensesRepoResult { items: ExpenseDBPopulated[], total: number, page: number, pageSize: number }

export type CreateExpensesRepoPayload = z.output<typeof createExpenseRepoSchema>

export type EditExpensesRepoPayload = z.output<typeof editExpenseRepoSchema>
