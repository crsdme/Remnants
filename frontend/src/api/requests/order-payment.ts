import type {
  createOrderPaymentParams,
  editOrderPaymentParams,
  getOrderPaymentsParams,
  OrderPaymentResponse,
  removeOrderPaymentsParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getOrderPayments(params: getOrderPaymentsParams) {
  return api.get<OrderPaymentResponse>('order-payments/get', { params })
}

export async function createOrderPayment(params: createOrderPaymentParams) {
  return api.post<OrderPaymentResponse>('order-payments/create', { ...params })
}

export async function editOrderPayment(params: editOrderPaymentParams) {
  return api.post<OrderPaymentResponse>('order-payments/edit', params)
}

export async function removeOrderPayment(params: removeOrderPaymentsParams) {
  return api.post<OrderPaymentResponse>('order-payments/remove', params)
}
