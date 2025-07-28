import type {
  createExpenseParams,
  editExpenseParams,
  ExpenseResponse,
  getExpensesParams,
  removeExpensesParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getExpenses(params: getExpensesParams) {
  return api.get<ExpenseResponse>('expenses/get', { params })
}

export async function createExpense(params: createExpenseParams) {
  return api.post<ExpenseResponse>('expenses/create', { ...params })
}

export async function editExpense(params: editExpenseParams) {
  return api.post<ExpenseResponse>('expenses/edit', params)
}

export async function removeExpense(params: removeExpensesParams) {
  return api.post<ExpenseResponse>('expenses/remove', params)
}
