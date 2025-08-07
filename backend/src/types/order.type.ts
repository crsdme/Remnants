import type { Code, DateRange, IdType, Message, Pagination, Sorter, Status } from './common.type'
import type { OrderPayment, OrderPaymentParams } from './order-payment.type'

export interface Order {
  id: IdType
  warehouse: string
  deliveryService: string
  orderSource: string
  orderStatus: string
  orderPayments: OrderPayment[]
  totals: {
    currency: IdType
    total: number
  }[]
  client: IdType
  comment: string
  createdBy: string
  confirmedBy: string
  removedBy: string
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  order: IdType
  product: string
  quantity: number
  price: number
  currency: IdType
  removedBy: string
  removed: boolean
  profit: number
  exchangeRate: number
  purchasePrice: number
  purchaseCurrency: string
}

export interface getOrdersResult {
  status: Status
  code: Code
  message: Message
  orders: Order[]
  ordersCount: number
}

export interface getOrdersFilters {
  ids: IdType[]
  seq: string
  warehouse: string
  deliveryService: string
  orderSource: string
  orderStatus: string
  orderPayments: OrderPayment[]
  client: IdType
  comment: string
  createdBy: string
  confirmedBy: string
  removedBy: string
  createdAt: DateRange
  updatedAt: DateRange
  removedAt: DateRange
}

export interface getOrdersSorters {
  names: Sorter
  color: Sorter
  priority: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getOrdersParams {
  filters?: Partial<getOrdersFilters>
  sorters?: Partial<getOrdersSorters>
  pagination?: Partial<Pagination>
}

export interface createOrderResult {
  status: Status
  code: Code
  message: Message
  order: Order
}

export interface createOrderParams {
  warehouse: string
  deliveryService: string
  orderSource: string
  orderStatus: string
  orderPayments: OrderPaymentParams[]
  client: IdType
  items: OrderItem[]
  comment: string
  createdBy: string
  confirmedBy: string
  removedBy: string
}

export interface editOrderResult {
  status: Status
  code: Code
  message: Message
  order: Order
}

export interface editOrderParams {
  id: IdType
  warehouse: string
  deliveryService: string
  orderSource: string
  orderStatus: string
  orderPayments: OrderPayment[]
  client: IdType
  items: OrderItem[]
  comment: string
  createdBy: string
  confirmedBy: string
  removedBy: string
}

export interface removeOrdersResult {
  status: Status
  code: Code
  message: Message
}

export interface removeOrdersParams {
  ids: IdType[]
}

export interface getOrderItemsFilters {
  order: IdType[]
  showFullData?: boolean
}

export interface getOrderItemsParams {
  filters?: Partial<getOrderItemsFilters>
  pagination?: Partial<Pagination>
}

export interface getOrderItemsResult {
  status: Status
  code: Code
  message: Message
  orderItems: OrderItem[]
  orderItemsCount: number
}

export interface getOrderPaymentsFilters {
  order: IdType
}

export interface getOrderPaymentsParams {
  filters?: Partial<getOrderPaymentsFilters>
  pagination?: Partial<Pagination>
}

export interface getOrderPaymentsResult {
  status: Status
  code: Code
  message: Message
  orderPayments: OrderPayment[]
  orderPaymentsCount: number
}

export interface payOrderResult {
  status: Status
  code: Code
  message: Message
}

export interface payOrderParams {
  id: IdType
}
