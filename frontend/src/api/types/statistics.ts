export interface getOrderStatisticParams {
  filters?: {
    ids?: string[]
    amount?: number
    currency?: string
    cashregister?: string
    cashregisterAccount?: string
    categories?: string[]
    sourceModel?: string
    sourceId?: string
  }
  sorters?: {
    priority?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface OrderStatisticResponse {
  status: string
  code: string
  message: string
  description: string
  statistics: any[]
}
