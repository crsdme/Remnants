import type {
  ExpenseDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import {
  createExpenseSchema,
  editExpenseSchema,
  getExpensesSchema,
  removeExpensesSchema,
} from '@remnant/shared'

export interface ExpenseDB {
  _id: string
  seq: number
  amount: number
  currency: string
  cashregister: string
  cashregisterAccount: string
  categories: string[]
  sourceModel: string
  sourceId: string
  type: string
  comment: string
  createdBy: string
  removedBy: string
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

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
export interface GetExpensesRepoResult { items: ExpenseDTO[], total: number, page: number, pageSize: number }

export type CreateExpensesRepoPayload = CreateExpensePayload

export type EditExpensesRepoPayload = EditExpensePayload
