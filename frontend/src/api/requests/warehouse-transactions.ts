import type {
  createWarehouseTransactionsParams,
  editWarehouseTransactionsParams,
  getWarehouseTransactionsItemsParams,
  getWarehouseTransactionsParams,
  receiveWarehouseTransactionsParams,
  removeWarehouseTransactionsParams,
  WarehouseTransactionsItemsResponse,
  WarehouseTransactionsResponse,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getWarehouseTransactions(params: getWarehouseTransactionsParams) {
  return api.get<WarehouseTransactionsResponse>('warehouse-transactions/get', { params })
}

export async function createWarehouseTransaction(params: createWarehouseTransactionsParams) {
  return api.post<WarehouseTransactionsResponse>('warehouse-transactions/create', { ...params })
}

export async function editWarehouseTransaction(params: editWarehouseTransactionsParams) {
  return api.post<WarehouseTransactionsResponse>('warehouse-transactions/edit', params)
}

export async function removeWarehouseTransaction(params: removeWarehouseTransactionsParams) {
  return api.post<WarehouseTransactionsResponse>('warehouse-transactions/remove', params)
}

export async function getWarehouseTransactionsItems(params: getWarehouseTransactionsItemsParams) {
  return api.get<WarehouseTransactionsItemsResponse>('warehouse-transactions/get/items', { params })
}

export async function receiveWarehouseTransaction(params: receiveWarehouseTransactionsParams) {
  return api.post<WarehouseTransactionsResponse>('warehouse-transactions/receive', params)
}
