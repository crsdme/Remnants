export interface getProductPropertiesParams {
  filters: {
    ids?: string[]
    names?: string
    language: string
    active?: boolean[]
    priority?: number
    type?: string
    options?: string[]
    showInTable?: boolean
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
    type?: string
    showInTable?: string
    createdAt?: string
    updatedAt?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface createProductPropertiesParams {
  names: LanguageString
  priority: number
  type: string
  showInTable?: boolean
  active?: boolean
}

export interface editProductPropertyParams {
  id: string
  names: LanguageString
  priority: number
  type: string
  showInTable?: boolean
  active?: boolean
}

export interface removeProductPropertiesParams {
  ids: string[]
}

export interface ProductPropertiesResponse {
  status: string
  code: string
  message: string
  description: string
  productProperties: ProductProperty[]
  productPropertiesCount: number
}
