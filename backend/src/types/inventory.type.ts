import type {
  InventoryDTO,
  InventoryItemDTO,
  scanBarcodeToDraftInventorySchema,
} from '@remnant/shared'
import type { z } from 'zod'
import type {
  createInventoriesRepoSchema,
  createInventoryItemsRepoSchema,
  editInventoryItemsRepoSchema,
  editInventoryRepoSchema,
} from '@/schemas'
import {
  createInventorySchema,
  editInventorySchema,
  getInventoriesSchema,
  getInventoryItemsSchema,
  removeInventoriesSchema,
} from '@remnant/shared'

export interface InventoryDB {
  _id: string
  seq: number
  status: string
  warehouse: string
  createdBy: string
  removedBy: string
  comment: string
  removedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface InventoryItemDB {
  _id: string
  inventoryId: string
  productId: string
  quantity: number
  receivedQuantity: number
  createdAt: Date
  updatedAt: Date
}

export type GetInventoriesPayload = z.output<typeof getInventoriesSchema>
export function parseGetInventories(x: unknown): GetInventoriesPayload {
  return getInventoriesSchema.parse(x)
}

export type GetInventoryItemsPayload = z.output<typeof getInventoryItemsSchema>
export function parseGetInventoryItems(x: unknown): GetInventoryItemsPayload {
  return getInventoryItemsSchema.parse(x)
}

export type CreateInventoriesPayload = z.output<typeof createInventorySchema>
export function parseCreateInventory(x: unknown): CreateInventoriesPayload {
  return createInventorySchema.parse(x)
}

export type EditInventoriesPayload = z.output<typeof editInventorySchema>
export function parseEditInventory(x: unknown): EditInventoriesPayload {
  return editInventorySchema.parse(x)
}

export type RemoveInventoriesPayload = z.output<typeof removeInventoriesSchema>
export function parseRemoveInventories(x: unknown): RemoveInventoriesPayload {
  return removeInventoriesSchema.parse(x)
}

export type ScanBarcodeToDraftInventoryPayload = z.output<typeof scanBarcodeToDraftInventorySchema>

export type GetInventoriesRepoPayload = GetInventoriesPayload
export interface GetInventoriesRepoResult { items: InventoryDTO[], total: number, page: number, pageSize: number }

export type GetInventoryItemsRepoPayload = GetInventoryItemsPayload
export interface GetInventoryItemsRepoResult { items: InventoryItemDTO[], total: number, page: number, pageSize: number }

export type EditInventoryItemsRepoPayload = z.output<typeof editInventoryItemsRepoSchema>

export type CreateInventoryItemsRepoPayload = z.output<typeof createInventoryItemsRepoSchema>

export type EditInventoryRepoPayload = z.output<typeof editInventoryRepoSchema>

export type CreateInventoriesRepoPayload = z.output<typeof createInventoriesRepoSchema>
