import type { IdType, Response, ResponseItem, ResponseList } from './common.type'
import type { CurrencyDTO } from './currency.type'

export interface OrderPaymentDTO {
  id: IdType
  order: string
  cashregister: string
  cashregisterAccount: string
  amount: number
  currency: CurrencyDTO
  paymentStatus: string
  paymentDate: Date
  transaction: string
  comment: string
  createdBy: string
  removedBy: string
  createdAt: Date
  updatedAt: Date
}

export type GetOrderPaymentsResponse = ResponseList<OrderPaymentDTO>

export type CreateOrderPaymentResponse = ResponseItem<OrderPaymentDTO>

export type EditOrderPaymentResponse = ResponseItem<OrderPaymentDTO>

export type RemoveOrderPaymentsResponse = Response
