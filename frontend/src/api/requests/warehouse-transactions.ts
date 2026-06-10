import type {
  CreateWarehouseTransactionRequest,
  CreateWarehouseTransactionResponse,
  EditWarehouseTransactionRequest,
  EditWarehouseTransactionResponse,
  GetWarehouseTransactionsItemsRequest,
  GetWarehouseTransactionsItemsResponse,
  GetWarehouseTransactionsRequest,
  GetWarehouseTransactionsResponse,
  ReceiveWarehouseTransactionRequest,
  ReceiveWarehouseTransactionResponse,
  RemoveWarehouseTransactionsRequest,
  RemoveWarehouseTransactionsResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getWarehouseTransactions(params: GetWarehouseTransactionsRequest) {
  return api.get<GetWarehouseTransactionsResponse>('warehouse-transactions/get', { params })
}

export async function createWarehouseTransaction(params: CreateWarehouseTransactionRequest) {
  return api.post<CreateWarehouseTransactionResponse>('warehouse-transactions/create', { ...params })
}

export async function editWarehouseTransaction(params: EditWarehouseTransactionRequest) {
  return api.post<EditWarehouseTransactionResponse>('warehouse-transactions/edit', params)
}

export async function removeWarehouseTransaction(params: RemoveWarehouseTransactionsRequest) {
  return api.post<RemoveWarehouseTransactionsResponse>('warehouse-transactions/remove', params)
}

export async function getWarehouseTransactionsItems(params: GetWarehouseTransactionsItemsRequest) {
  return api.get<GetWarehouseTransactionsItemsResponse>('warehouse-transactions/get/items', { params })
}

// export async function scanBarcodeToDraft(params: ScanBarcodeToDraftsRequest) {
//   return api.get<ScanBarcodeToDraftWTResponse>('warehouse-transactions/scan/barcode', { params })
// }

export async function receiveWarehouseTransaction(params: ReceiveWarehouseTransactionRequest) {
  return api.post<ReceiveWarehouseTransactionResponse>('warehouse-transactions/receive', params)
}
