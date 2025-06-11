import { api } from '@/api/instance'

export interface getProductPropertiesOptionsParams {
  filters: {
    ids?: string[]
    names?: string
    language: string
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

export async function getProductPropertiesOptions(params: getProductPropertiesOptionsParams) {
  return api.get<ProductPropertiesOptionsResponse>('product-properties-options/get', { params })
}

export interface createProductPropertiesOptionParams {
  names: LanguageString
  priority: number
  active?: boolean
}

export async function createProductPropertyOption(params: createProductPropertiesOptionParams) {
  return api.post<ProductPropertiesOptionsResponse>('product-properties-options/create', { ...params })
}

export interface editProductPropertyOptionParams {
  id: string
  names: LanguageString
  priority: number
  active?: boolean
}

export async function editProductPropertyOption(params: editProductPropertyOptionParams) {
  return api.post<ProductPropertiesOptionsResponse>('product-properties-options/edit', params)
}

export interface removeProductPropertyOptionParams {
  ids: string[]
}

export async function removeProductPropertyOption(params: removeProductPropertyOptionParams) {
  return api.post<ProductPropertiesOptionsResponse>('product-properties-options/remove', params)
}
