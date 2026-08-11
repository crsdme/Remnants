import type {
  CreateOrderRequest,
  CreateOrderResponse,
  EditOrderRequest,
  EditOrderResponse,
  GetOrderDetailsRequest,
  GetOrderDetailsResponse,
  GetOrderItemsRequest,
  GetOrderItemsResponse,
  GetOrdersRequest,
  GetOrdersResponse,
  PrintDraftInvoiceOrderRequest,
  PrintDraftInvoiceOrderResponse,
  RemoveOrdersRequest,
  RemoveOrdersResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getOrders(params: GetOrdersRequest) {
  return api.get<GetOrdersResponse>('orders/get', { params })
}

export async function getOrderDetails(params: GetOrderDetailsRequest) {
  return api.get<GetOrderDetailsResponse>('orders/get/details', { params })
}

export async function getOrderItems(params: GetOrderItemsRequest) {
  return api.get<GetOrderItemsResponse>('orders/get/items', { params })
}

export async function createOrder(params: CreateOrderRequest | FormData) {
  return api.post<CreateOrderResponse>('orders/create', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function editOrder(params: EditOrderRequest | FormData) {
  return api.post<EditOrderResponse>('orders/edit', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function removeOrder(params: RemoveOrdersRequest) {
  return api.post<RemoveOrdersResponse>('orders/remove', params)
}

export async function printDraftInvoice(params: PrintDraftInvoiceOrderRequest) {
  return api.post<PrintDraftInvoiceOrderResponse>('orders/print/draft-invoice', { ...params }, { responseType: 'blob' })
}
