import type { Code, DateRange, IdType, Message, Pagination, Sorter, Status } from './common.type'

export interface OrderPayment {
  id: IdType
  order: string
  cashregister: string
  cashregisterAccount: string
  amount: number
  currency: string
  paymentStatus: string
  paymentDate: Date
  transaction: string
  comment: string
  createdBy: string
  removedBy: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderPaymentParams {
  order: string
  cashregister: string
  cashregisterAccount: string
  amount: number
  currency: string
  paymentStatus: string
  paymentDate: Date
  comment: string
  createdBy: string
}

export interface getOrderPaymentsResult {
  status: Status
  code: Code
  message: Message
  orderPayments: OrderPayment[]
  orderPaymentsCount: number
}

export interface getOrderPaymentsFilters {
  order: string
  cashregister: string
  cashregisterAccount: string
  amount: number
  currency: string
  paymentStatus: string
  paymentDate: DateRange
  transaction: string
  createdBy: string
  removedBy: string
  createdAt: DateRange
  updatedAt: DateRange
  removedAt: DateRange
}

export interface getOrderPaymentsSorters {
  amount: Sorter
  currency: Sorter
  paymentStatus: Sorter
  paymentDate: Sorter
  createdAt: Sorter
  updatedAt: Sorter
}

export interface getOrderPaymentsParams {
  filters?: Partial<getOrderPaymentsFilters>
  sorters?: Partial<getOrderPaymentsSorters>
  pagination?: Partial<Pagination>
}

export interface createOrderPaymentResult {
  status: Status
  code: Code
  message: Message
  orderPayment: OrderPayment
}

export interface createOrderPaymentParams {
  order: IdType
  cashregister: string
  cashregisterAccount: string
  amount: number
  currency: string
  paymentStatus: string
  paymentDate: Date
  comment: string
  createdBy: string
}

export interface editOrderPaymentResult {
  status: Status
  code: Code
  message: Message
  orderPayment: OrderPayment
}

export interface editOrderPaymentParams {
  id: IdType
  order: string
  cashregister: string
  cashregisterAccount: string
  amount: number
  currency: string
  paymentStatus: string
  paymentDate: Date
  transaction: string
  comment: string
  createdBy: string
  removedBy: string
}

export interface removeOrderPaymentsResult {
  status: Status
  code: Code
  message: Message
}

export interface removeOrderPaymentsParams {
  ids: IdType[]
}
