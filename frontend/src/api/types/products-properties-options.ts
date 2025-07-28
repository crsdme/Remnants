export interface getProductPropertiesOptionsParams {
  filters: {
    ids?: any
    names?: string
    language?: string
    active?: boolean[]
    productProperty?: string
    priority?: number
    createdAt?: {
      from?: Date
      to?: Date
    }
    updatedAt?: {
      from?: Date
      to?: Date
    }
  }
  sorters?: {
    names?: string
    priority?: string
    createdAt?: string
    updatedAt?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface createProductPropertiesOptionParams {
  names: LanguageString
  priority: number
  active?: boolean
}

export interface editProductPropertyOptionParams {
  id: string
  names: LanguageString
  priority: number
  active?: boolean
}

export interface removeProductPropertyOptionParams {
  ids: string[]
}

export interface ProductPropertiesOptionsResponse {
  status: string
  code: string
  message: string
  description: string
  productPropertiesOptions: ProductPropertyOption[]
  productPropertiesOptionsCount: number
}
