export interface getOrderStatusesParams {
  filters?: {
    names?: string
    color?: string
    priority?: number
    language?: string
    orderStatus?: string
    includeAll?: boolean
    includeCount?: boolean
    isLocked?: boolean
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
  isLocked?: boolean
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
  isLocked?: boolean
}

export interface removeOrderStatusesParams {
  ids: string[]
}
