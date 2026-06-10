import type {
  CreateExpenseCategoryRequest,
  CreateExpenseCategoryResponse,
  EditExpenseCategoryRequest,
  EditExpenseCategoryResponse,
  GetExpenseCategoriesRequest,
  GetExpenseCategoriesResponse,
  RemoveExpenseCategoriesRequest,
  RemoveExpenseCategoriesResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getExpenseCategories(params: GetExpenseCategoriesRequest) {
  return api.get<GetExpenseCategoriesResponse>('expense-categories/get', { params })
}

export async function createExpenseCategory(params: CreateExpenseCategoryRequest) {
  return api.post<CreateExpenseCategoryResponse>('expense-categories/create', { ...params })
}

export async function editExpenseCategory(params: EditExpenseCategoryRequest) {
  return api.post<EditExpenseCategoryResponse>('expense-categories/edit', params)
}

export async function removeExpenseCategory(params: RemoveExpenseCategoriesRequest) {
  return api.post<RemoveExpenseCategoriesResponse>('expense-categories/remove', params)
}
