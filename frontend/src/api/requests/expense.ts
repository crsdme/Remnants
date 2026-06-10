import type {
  CreateExpenseRequest,
  CreateExpenseResponse,
  EditExpenseRequest,
  EditExpenseResponse,
  GetExpensesRequest,
  GetExpensesResponse,
  RemoveExpensesRequest,
  RemoveExpensesResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getExpenses(params: GetExpensesRequest) {
  return api.get<GetExpensesResponse>('expenses/get', { params })
}

export async function createExpense(params: CreateExpenseRequest) {
  return api.post<CreateExpenseResponse>('expenses/create', { ...params })
}

export async function editExpense(params: EditExpenseRequest) {
  return api.post<EditExpenseResponse>('expenses/edit', params)
}

export async function removeExpense(params: RemoveExpensesRequest) {
  return api.post<RemoveExpensesResponse>('expenses/remove', params)
}
