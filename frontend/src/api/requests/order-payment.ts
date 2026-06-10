import type {
  CreateOrderPaymentRequest,
  CreateOrderPaymentResponse,
  EditOrderPaymentRequest,
  EditOrderPaymentResponse,
  GetOrderPaymentsRequest,
  GetOrderPaymentsResponse,
  RemoveOrderPaymentsRequest,
  RemoveOrderPaymentsResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getOrderPayments(params: GetOrderPaymentsRequest) {
  return api.get<GetOrderPaymentsResponse>('order-payments/get', { params })
}

export async function createOrderPayment(params: CreateOrderPaymentRequest) {
  return api.post<CreateOrderPaymentResponse>('order-payments/create', { ...params })
}

export async function editOrderPayment(params: EditOrderPaymentRequest) {
  return api.post<EditOrderPaymentResponse>('order-payments/edit', params)
}

export async function removeOrderPayment(params: RemoveOrderPaymentsRequest) {
  return api.post<RemoveOrderPaymentsResponse>('order-payments/remove', params)
}
