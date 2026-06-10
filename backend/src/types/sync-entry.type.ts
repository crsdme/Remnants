import type { z } from 'zod'
import type {
  createSyncEntryResponseSchema,
  editSyncEntryResponseSchema,
  getSyncEntriesResponseSchema,
  removeSyncEntriesResponseSchema,
  syncEntrySchema,
  syncProductCreateResponseSchema,
  syncProductCreateSchema,
  syncProductEditResponseSchema,
  syncProductEditSchema,

  syncProductQuantityResponseSchema,
  syncProductQuantitySchema,
} from '@/schemas/'
import {
  createSyncEntrySchema,
  editSyncEntrySchema,
  getSyncEntriesSchema,
  removeSyncEntriesSchema,
} from '@/schemas/'

export interface SyncEntryDB {
  _id: string
  sourceType: string
  sourceId: string
  site: string
  externalId: string
  status: 'pending' | 'synced' | 'error'
  syncedAt: Date
  lastError: string
  createdAt: Date
  updatedAt: Date
}
export type CreateSyncEntryPayload = z.output<typeof createSyncEntrySchema>
export function parseCreateSyncEntry(x: unknown): CreateSyncEntryPayload {
  return createSyncEntrySchema.parse(x)
}

export type EditSyncEntryPayload = z.output<typeof editSyncEntrySchema>
export function parseEditSyncEntry(x: unknown): EditSyncEntryPayload {
  return editSyncEntrySchema.parse(x)
}

export type RemoveSyncEntriesPayload = z.output<typeof removeSyncEntriesSchema>
export function parseRemoveSyncEntries(x: unknown): RemoveSyncEntriesPayload {
  return removeSyncEntriesSchema.parse(x)
}

export type GetSyncEntriesPayload = z.output<typeof getSyncEntriesSchema>
export function parseGetSyncEntries(x: unknown): GetSyncEntriesPayload {
  return getSyncEntriesSchema.parse(x)
}

export type SyncProductCreatePayload = z.output<typeof syncProductCreateSchema>

export type SyncProductEditPayload = z.output<typeof syncProductEditSchema>

export type SyncProductQuantityPayload = z.output<typeof syncProductQuantitySchema>

export type GetSyncEntriesRepoPayload = GetSyncEntriesPayload
export interface GetSyncEntriesRepoResult { items: SyncEntryDTO[], total: number, page: number, pageSize: number }

export type CreateSyncEntryRepoPayload = CreateSyncEntryPayload

export type EditSyncEntryRepoPayload = EditSyncEntryPayload

export type SyncEntryDTO = z.infer<typeof syncEntrySchema>

export type GetSyncEntriesResponse = z.infer<typeof getSyncEntriesResponseSchema>

export type CreateSyncEntryResponse = z.infer<typeof createSyncEntryResponseSchema>

export type EditSyncEntryResponse = z.infer<typeof editSyncEntryResponseSchema>

export type RemoveSyncEntriesResponse = z.infer<typeof removeSyncEntriesResponseSchema>

export type SyncProductCreateResponse = z.infer<typeof syncProductCreateResponseSchema>

export type SyncProductEditResponse = z.infer<typeof syncProductEditResponseSchema>

export type SyncProductQuantityResponse = z.infer<typeof syncProductQuantityResponseSchema>
