import type {
  ConfirmInventoryRequest,
  ConfirmInventoryResponse,
  CreateInventoryRequest,
  CreateInventoryResponse,
  EditInventoryRequest,
  EditInventoryResponse,
  ExportInventoryRequest,
  GetInventoriesRequest,
  GetInventoriesResponse,
  GetInventoryItemsRequest,
  GetInventoryItemsResponse,
  GetInventoryProgressRequest,
  GetInventoryProgressResponse,
  RemoveInventoriesRequest,
  RemoveInventoriesResponse,
  ScanBarcodeToDraftInventoryResponse,
  ScanBarcodeToDraftsRequest,
  UpsertInventoryItemRequest,
  UpsertInventoryItemResponse,
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

export async function upsertInventoryItem(params: UpsertInventoryItemRequest) {
  return api.post<UpsertInventoryItemResponse>('inventories/upsert-item', params)
}

export async function confirmInventory(params: ConfirmInventoryRequest) {
  return api.post<ConfirmInventoryResponse>('inventories/confirm', params)
}

export async function removeInventory(params: RemoveInventoriesRequest) {
  return api.post<RemoveInventoriesResponse>('inventories/remove', params)
}

export async function getInventoryItems(params: GetInventoryItemsRequest) {
  return api.get<GetInventoryItemsResponse>('inventories/get/items', { params })
}

export async function getInventoryProgress(params: GetInventoryProgressRequest) {
  return api.get<GetInventoryProgressResponse>('inventories/get/progress', {
    params,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  })
}

export async function scanInventoryBarcode(params: ScanBarcodeToDraftsRequest) {
  return api.get<ScanBarcodeToDraftInventoryResponse>('inventories/scan/barcode', { params })
}

export async function exportInventory(params: ExportInventoryRequest) {
  return api.post<Blob>('inventories/export', params, {
    responseType: 'blob',
  })
}
