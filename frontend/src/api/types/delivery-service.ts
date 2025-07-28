export interface getDeliveryServicesParams {
  filters?: {
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

export interface createDeliveryServicesParams {
  names: LanguageString
  priority: number
  color?: string
  type: 'novaposhta' | 'selfpickup'
}

export interface DeliveryServicesResponse {
  status: string
  code: string
  message: string
  description: string
  deliveryServices: DeliveryService[]
  deliveryServicesCount: number
}

export interface editDeliveryServicesParams {
  id: string
  names: LanguageString
  priority: number
  type: 'novaposhta' | 'selfpickup'
  color?: string
}

export interface removeDeliveryServicesParams {
  ids: string[]
}
