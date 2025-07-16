export interface getOrderSourcesParams {
  filters: {
    names?: string
    color?: string
    priority?: number
    language?: string
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

export interface createOrderSourcesParams {
  names: LanguageString
  priority: number
  color?: string
}

export interface OrderSourcesResponse {
  status: string
  code: string
  message: string
  description: string
  orderSources: OrderSource[]
  orderSourcesCount: number
}

export interface editOrderSourcesParams {
  id: string
  names: LanguageString
  priority: number
  color?: string
}

export interface removeOrderSourcesParams {
  ids: string[]
}
