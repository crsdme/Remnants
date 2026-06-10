import type {
  CreateInventoryRequest,
  CreateInventoryResponse,
  EditInventoryRequest,
  EditInventoryResponse,
  GetInventoriesRequest,
  GetInventoriesResponse,
  GetInventoryItemsRequest,
  GetInventoryItemsResponse,
  RemoveInventoriesRequest,
  RemoveInventoriesResponse,
  ScanBarcodeToDraftInventoryResponse,
  ScanBarcodeToDraftsRequest,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getInventories(params: GetInventoriesRequest) {
  return api.get<GetInventoriesResponse>('inventories/get', { params })
}

export async function createInventory(params: CreateInventoryRequest) {
  return api.post<CreateInventoryResponse>('inventories/create', { ...params })
}

export async function editInventory(params: EditInventoryRequest) {
  return api.post<EditInventoryResponse>('inventories/edit', params)
}

export async function removeInventory(params: RemoveInventoriesRequest) {
  return api.post<RemoveInventoriesResponse>('inventories/remove', params)
}

export async function getInventoryItems(params: GetInventoryItemsRequest) {
  return api.get<GetInventoryItemsResponse>('inventories/get/items', { params })
}

export async function scanInventoryBarcode(params: ScanBarcodeToDraftsRequest) {
  return api.get<ScanBarcodeToDraftInventoryResponse>('inventories/scan/barcode', { params })
}
