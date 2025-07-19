export interface getOrderStatusesParams {
  filters?: {
    names?: string
    color?: string
    priority?: number
    language?: string
    orderStatus?: string
  }
  sorters?: {
    priority?: string
    color?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface createOrderStatusesParams {
  names: LanguageString
  priority: number
  color?: string
}

export interface OrderStatusesResponse {
  status: string
  code: string
  message: string
  description: string
  orderStatuses: OrderStatus[]
  orderStatusesCount: number
}

export interface editOrderStatusesParams {
  id: string
  names: LanguageString
  priority: number
  color?: string
}

export interface removeOrderStatusesParams {
  ids: string[]
}
