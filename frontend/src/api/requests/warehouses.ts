import type {
  CreateWarehouseRequest,
  CreateWarehousesResponse,
  EditWarehouseRequest,
  EditWarehousesResponse,
  GetWarehousesRequest,
  GetWarehousesResponse,
  RemoveWarehousesRequest,
  RemoveWarehousesResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getWarehouses(params: GetWarehousesRequest) {
  return api.get<GetWarehousesResponse>('warehouses/get', { params })
}

export async function createWarehouse(params: CreateWarehouseRequest) {
  return api.post<CreateWarehousesResponse>('warehouses/create', { ...params })
}

export async function editWarehouse(params: EditWarehouseRequest) {
  return api.post<EditWarehousesResponse>('warehouses/edit', params)
}

export async function removeWarehouse(params: RemoveWarehousesRequest) {
  return api.post<RemoveWarehousesResponse>('warehouses/remove', params)
}
