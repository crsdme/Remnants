import type {
  createOrderParams,
  editOrderParams,
  getOrdersParams,
  OrderResponse,
  printDraftInvoiceParams,
  removeOrdersParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getOrders(params: getOrdersParams) {
  return api.get<OrderResponse>('orders/get', { params })
}

export async function createOrder(params: createOrderParams) {
  return api.post<OrderResponse>('orders/create', { ...params })
}

export async function editOrder(params: editOrderParams) {
  return api.post<OrderResponse>('orders/edit', params)
}

export async function removeOrder(params: removeOrdersParams) {
  return api.post<OrderResponse>('orders/remove', params)
}

export async function printDraftInvoice(params: printDraftInvoiceParams) {
  return api.post<Blob>('orders/print/draft-invoice', { ...params }, { responseType: 'blob' })
}
