import type {
  InventoryDTO,
  InventoryItemDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import type {
  createInventoriesRepoSchema,
  createInventoryItemsRepoSchema,
  editInventoryItemsRepoSchema,
  editInventoryRepoSchema,
  inventoryDBSchema,
  inventoryItemDBSchema,
} from '@/schemas'
import {
  confirmInventorySchema,
  createInventorySchema,
  editInventorySchema,
  exportInventorySchema,
  getInventoriesSchema,
  getInventoryItemsSchema,
  getInventoryProgressSchema,
  removeInventoriesSchema,
  scanBarcodeToDraftsSchema,
  upsertInventoryItemSchema,
} from '@remnant/shared'

export type InventoryDB = z.infer<typeof inventoryDBSchema>
export type InventoryItemDB = z.infer<typeof inventoryItemDBSchema>

export type GetInventoriesPayload = z.output<typeof getInventoriesSchema>
export function parseGetInventories(x: unknown): GetInventoriesPayload {
  return getInventoriesSchema.parse(x)
}

export type GetInventoryItemsPayload = z.output<typeof getInventoryItemsSchema>
export function parseGetInventoryItems(x: unknown): GetInventoryItemsPayload {
  return getInventoryItemsSchema.parse(x)
}

export type GetInventoryProgressPayload = z.output<typeof getInventoryProgressSchema>
export function parseGetInventoryProgress(x: unknown): GetInventoryProgressPayload {
  return getInventoryProgressSchema.parse(x)
}

export type CreateInventoriesPayload = z.output<typeof createInventorySchema>
export function parseCreateInventory(x: unknown): CreateInventoriesPayload {
  return createInventorySchema.parse(x)
}

export type EditInventoriesPayload = z.output<typeof editInventorySchema>
export function parseEditInventory(x: unknown): EditInventoriesPayload {
  return editInventorySchema.parse(x)
}

export type UpsertInventoryItemPayload = z.output<typeof upsertInventoryItemSchema>
export function parseUpsertInventoryItem(x: unknown): UpsertInventoryItemPayload {
  return upsertInventoryItemSchema.parse(x)
}

export type ConfirmInventoryPayload = z.output<typeof confirmInventorySchema>
export function parseConfirmInventory(x: unknown): ConfirmInventoryPayload {
  return confirmInventorySchema.parse(x)
}

export type RemoveInventoriesPayload = z.output<typeof removeInventoriesSchema>
export function parseRemoveInventories(x: unknown): RemoveInventoriesPayload {
  return removeInventoriesSchema.parse(x)
}

export type ScanBarcodeToDraftsPayload = z.output<typeof scanBarcodeToDraftsSchema>
export function parseScanBarcodeToDrafts(x: unknown): ScanBarcodeToDraftsPayload {
  return scanBarcodeToDraftsSchema.parse(x)
}

export type ExportInventoryPayload = z.output<typeof exportInventorySchema>
export function parseExportInventory(x: unknown): ExportInventoryPayload {
  return exportInventorySchema.parse(x)
}

export type GetInventoriesRepoPayload = GetInventoriesPayload
export interface GetInventoriesRepoResult { items: InventoryDTO[], total: number, page: number, pageSize: number }

export type GetInventoryItemsRepoPayload = GetInventoryItemsPayload
export interface GetInventoryItemsRepoResult { items: InventoryItemDTO[], total: number, page: number, pageSize: number }

export type EditInventoryItemsRepoPayload = z.output<typeof editInventoryItemsRepoSchema>

export type CreateInventoryItemsRepoPayload = z.output<typeof createInventoryItemsRepoSchema>

export type EditInventoryRepoPayload = z.output<typeof editInventoryRepoSchema>

export type CreateInventoriesRepoPayload = z.output<typeof createInventoriesRepoSchema>
