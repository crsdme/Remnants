import { api } from '@/api/instance'

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

export async function getProductPropertiesGroups(params: getProductPropertiesGroupsParams) {
  return api.get<ProductPropertiesGroupsResponse>('product-properties-groups/get', { params })
}

export interface createProductPropertiesGroupsParams {
  names: LanguageString
  priority: number
  productProperties?: string[]
  active?: boolean
}

export async function createProductPropertiesGroups(params: createProductPropertiesGroupsParams) {
  return api.post<ProductPropertiesGroupsResponse>('product-properties-groups/create', { ...params })
}

export interface editProductPropertiesGroupsParams {
  id: string
  names: LanguageString
  priority: number
  active?: boolean
}

export async function editProductPropertiesGroups(params: editProductPropertiesGroupsParams) {
  return api.post<ProductPropertiesGroupsResponse>('product-properties-groups/edit', params)
}

export interface removeProductPropertiesGroupsParams {
  ids: string[]
}

export async function removeProductPropertiesGroups(params: removeProductPropertiesGroupsParams) {
  return api.post<ProductPropertiesGroupsResponse>('product-properties-groups/remove', params)
}
