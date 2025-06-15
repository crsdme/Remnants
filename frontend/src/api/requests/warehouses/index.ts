import { api } from '@/api/instance'

export interface getWarehousesParams {
  filters: {
    names?: string
    active?: boolean[]
    priority?: number
    language: string
  }
  sorters?: {
    priority?: string
    active?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export async function getWarehouses(params: getWarehousesParams) {
  return api.get<WarehousesResponse>('warehouses/get', { params })
}

export interface createWarehousesParams {
  names: LanguageString
  priority: number
  active?: boolean
}

export async function createWarehouse(params: createWarehousesParams) {
  return api.post<WarehousesResponse>('warehouses/create', { ...params })
}

export interface editWarehouseParams {
  id: string
  names: LanguageString
  priority: number
  active?: boolean
}

export async function editWarehouse(params: editWarehouseParams) {
  return api.post<WarehousesResponse>('warehouses/edit', params)
}

export interface removeWarehouseParams {
  ids: string[]
}

export async function removeWarehouse(params: removeWarehouseParams) {
  return api.post<WarehousesResponse>('warehouses/remove', params)
}
