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

export async function createExpense(params: CreateExpenseRequest | FormData) {
  return api.post<CreateExpenseResponse>('expenses/create', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function editExpense(params: EditExpenseRequest | FormData) {
  return api.post<EditExpenseResponse>('expenses/edit', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function removeExpense(params: RemoveExpensesRequest) {
  return api.post<RemoveExpensesResponse>('expenses/remove', params)
}
