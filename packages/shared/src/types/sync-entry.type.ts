import type {
  IdType,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface SyncEntryDTO {
  id: IdType
  sourceType: string
  sourceId: IdType
  site: IdType
  externalId: IdType
  status: 'pending' | 'synced' | 'error'
  syncedAt: Date
  lastError: string
  createdAt: Date
  updatedAt: Date
}

export type GetSyncEntriesResponse = ResponseList<SyncEntryDTO>

export type CreateSyncEntryResponse = ResponseItem<SyncEntryDTO>

export type EditSyncEntryResponse = ResponseItem<SyncEntryDTO>

export type RemoveSyncEntriesResponse = Response

export type SyncProductCreateResponse = Response

export type SyncProductEditResponse = Response

export type SyncProductQuantityResponse = Response
