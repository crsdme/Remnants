export interface getProductPropertiesGroupsParams {
  filters: {
    names?: string
    language: string
    active?: boolean[]
    productProperties?: ProductProperty[]
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

export interface createProductPropertiesGroupsParams {
  names: LanguageString
  priority: number
  productProperties?: string[]
  active?: boolean
}

export interface editProductPropertiesGroupsParams {
  id: string
  names: LanguageString
  priority: number
  active?: boolean
}

export interface removeProductPropertiesGroupsParams {
  ids: string[]
}

export interface ProductPropertiesGroupsResponse {
  status: string
  code: string
  message: string
  description: string
  productPropertyGroups: ProductPropertyGroup[]
  productPropertyGroupsCount: number
}
