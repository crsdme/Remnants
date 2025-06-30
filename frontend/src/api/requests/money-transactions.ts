import type {
  createMoneyTransactionsParams,
  editMoneyTransactionsParams,
  getMoneyTransactionsParams,
  MoneyTransactionsResponse,
  removeMoneyTransactionsParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getMoneyTransactions(params: getMoneyTransactionsParams) {
  return api.get<MoneyTransactionsResponse>('money-transactions/get', { params })
}

export async function createMoneyTransaction(params: createMoneyTransactionsParams) {
  return api.post<MoneyTransactionsResponse>('money-transactions/create', { ...params })
}

export async function editMoneyTransaction(params: editMoneyTransactionsParams) {
  return api.post<MoneyTransactionsResponse>('money-transactions/edit', params)
}

export async function removeMoneyTransaction(params: removeMoneyTransactionsParams) {
  return api.post<MoneyTransactionsResponse>('money-transactions/remove', params)
}
