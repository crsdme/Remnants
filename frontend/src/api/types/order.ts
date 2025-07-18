export interface getOrdersParams {
  filters: {
    warehouse?: string
    deliveryService?: string
    orderSource?: string
    orderStatus?: string
    orderPayments?: string
    client?: string
    comment?: string
  }
  sorters?: {
    createdAt?: string
    updatedAt?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface createOrderParams {
  warehouse: string
  deliveryService: string
  orderSource: string
  orderStatus: string
  orderPayments: string
  client: string
  comment: string
  items: OrderItem[]
}

export interface OrderResponse {
  status: string
  code: string
  message: string
  description: string
  order: Order
  orderCount: number
}

export interface editOrderParams {
  id: string
  warehouse: string
  deliveryService: string
  orderSource: string
  orderStatus: string
  orderPayments: string
  client: string
  comment: string
  items: OrderItem[]
}

export interface removeOrdersParams {
  ids: string[]
}
