import type {
  CreateOrderRequest,
  CreateOrderResponse,
  CreateOrderShipmentRequest,
  CreateOrderShipmentResponse,
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
  PrintOrderShipmentLabelRequest,
  RemoveOrdersRequest,
  RemoveOrdersResponse,
  SyncOrderShipmentsRequest,
  SyncOrderShipmentsResponse,
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

export async function printOrderShipmentLabel(params: PrintOrderShipmentLabelRequest) {
  return api.get<Blob>('orders/shipment/print-label', { params, responseType: 'blob' })
}

export async function createOrderShipment(params: CreateOrderShipmentRequest) {
  return api.post<CreateOrderShipmentResponse>('orders/shipment/create', params)
}

export async function syncOrderShipments(params: SyncOrderShipmentsRequest = {}) {
  return api.post<SyncOrderShipmentsResponse>('orders/shipment/sync', params)
}
