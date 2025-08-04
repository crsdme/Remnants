import type { Code, DateRange, IdType, Message, Pagination, Sorter, Status } from './common.type'

export interface SyncEntry {
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

export interface getSyncEntriesResult {
  status: Status
  code: Code
  message: Message
  syncEntries: SyncEntry[]
  syncEntriesCount: number
}

export interface getSyncEntriesFilters {
  id: IdType
  sourceType: string
  sourceId: IdType
  site: IdType
  externalId: IdType
  status: 'pending' | 'synced' | 'error'
  syncedAt: DateRange
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getSyncEntriesSorters {
  syncedAt: Sorter
  createdAt: Sorter
  updatedAt: Sorter
}

export interface getSyncEntriesParams {
  filters?: Partial<getSyncEntriesFilters>
  sorters?: Partial<getSyncEntriesSorters>
  pagination?: Partial<Pagination>
}

export interface createSyncEntryResult {
  status: Status
  code: Code
  message: Message
  syncEntry: SyncEntry
}

export interface createSyncEntryParams {
  sourceType: string
  site: IdType
}

export interface editSyncEntryResult {
  status: Status
  code: Code
  message: Message
  syncEntry: SyncEntry
}

export interface editSyncEntryParams {
  id: IdType
  sourceType: string
  site: IdType
}

export interface removeSyncEntriesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeSyncEntriesParams {
  ids: IdType[]
}

export interface syncProductCreateResult {
  status: Status
  code: Code
  message: Message
}

export interface syncProductCreateParams {
  siteId: IdType
  productId: IdType
}

export interface syncProductEditResult {
  status: Status
  code: Code
  message: Message
}

export interface syncProductEditParams {
  siteId: IdType
  productId: IdType
  difference: Record<string, any>
}

export interface syncProductQuantityResult {
  status: Status
  code: Code
  message: Message
}

export interface syncProductQuantityParams {
  siteId: IdType
  productId: IdType
}
