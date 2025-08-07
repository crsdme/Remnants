import type {
  createInventoriesParams,
  editInventoriesParams,
  getInventoriesParams,
  getInventoryItemsParams,
  InventoriesResponse,
  InventoryItemsResponse,
  removeInventoriesParams,
  scanInventoryBarcodeParams,
  scanInventoryBarcodeResponse,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getInventories(params: getInventoriesParams) {
  return api.get<InventoriesResponse>('inventories/get', { params })
}

export async function createInventory(params: createInventoriesParams) {
  return api.post<InventoriesResponse>('inventories/create', { ...params })
}

export async function editInventory(params: editInventoriesParams) {
  return api.post<InventoriesResponse>('inventories/edit', params)
}

export async function removeInventory(params: removeInventoriesParams) {
  return api.post<InventoriesResponse>('inventories/remove', params)
}

export async function getInventoryItems(params: getInventoryItemsParams) {
  return api.get<InventoryItemsResponse>('inventories/get/items', { params })
}

export async function scanInventoryBarcode(params: scanInventoryBarcodeParams) {
  return api.get<scanInventoryBarcodeResponse>('inventories/scan/barcode', { params })
}
