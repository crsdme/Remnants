import { api } from '@/api/instance'

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

export async function getProductProperties(params: getProductPropertiesParams) {
  return api.get<ProductPropertiesResponse>('product-properties/get', { params })
}

export interface createProductPropertiesParams {
  names: LanguageString
  priority: number
  type: string
  isMultiple: boolean
  showInTable?: boolean
  active?: boolean
}

export async function createProductProperty(params: createProductPropertiesParams) {
  return api.post<ProductPropertiesResponse>('product-properties/create', { ...params })
}

export interface editProductPropertyParams {
  id: string
  names: LanguageString
  priority: number
  type: string
  isMultiple: boolean
  showInTable?: boolean
  active?: boolean
}

export async function editProductProperty(params: editProductPropertyParams) {
  return api.post<ProductPropertiesResponse>('product-properties/edit', params)
}

export interface removeProductPropertiesParams {
  ids: string[]
}

export async function removeProductProperties(params: removeProductPropertiesParams) {
  return api.post<ProductPropertiesResponse>('product-properties/remove', params)
}
