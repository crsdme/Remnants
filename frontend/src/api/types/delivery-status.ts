export interface getDeliveryStatusesParams {
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

export interface createDeliveryStatusesParams {
  names: LanguageString
  priority: number
  color?: string
}

export interface DeliveryStatusesResponse {
  status: string
  code: string
  message: string
  description: string
  deliveryStatuses: DeliveryStatus[]
  deliveryStatusesCount: number
}

export interface editDeliveryStatusesParams {
  id: string
  names: LanguageString
  priority: number
  color?: string
}

export interface removeDeliveryStatusesParams {
  ids: string[]
}
