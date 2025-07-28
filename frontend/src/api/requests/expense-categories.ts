import type {
  createExpenseCategoryParams,
  editExpenseCategoryParams,
  ExpenseCategoryResponse,
  getExpenseCategoriesParams,
  removeExpenseCategoriesParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getExpenseCategories(params: getExpenseCategoriesParams) {
  return api.get<ExpenseCategoryResponse>('expense-categories/get', { params })
}

export async function createExpenseCategory(params: createExpenseCategoryParams) {
  return api.post<ExpenseCategoryResponse>('expense-categories/create', { ...params })
}

export async function editExpenseCategory(params: editExpenseCategoryParams) {
  return api.post<ExpenseCategoryResponse>('expense-categories/edit', params)
}

export async function removeExpenseCategory(params: removeExpenseCategoriesParams) {
  return api.post<ExpenseCategoryResponse>('expense-categories/remove', params)
}
