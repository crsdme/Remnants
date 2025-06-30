import type {
  createWarehousesParams,
  editWarehouseParams,
  getWarehousesParams,
  removeWarehouseParams,
  WarehousesResponse,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getWarehouses(params: getWarehousesParams) {
  return api.get<WarehousesResponse>('warehouses/get', { params })
}

export async function createWarehouse(params: createWarehousesParams) {
  return api.post<WarehousesResponse>('warehouses/create', { ...params })
}

export async function editWarehouse(params: editWarehouseParams) {
  return api.post<WarehousesResponse>('warehouses/edit', params)
}

export async function removeWarehouse(params: removeWarehouseParams) {
  return api.post<WarehousesResponse>('warehouses/remove', params)
}
