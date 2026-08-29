import type { SyncEntryDB, SyncEntryDTO } from '@/types'

export function mapSyncEntryToDTO(syncEntry: SyncEntryDB): SyncEntryDTO {
  return {
    id: syncEntry._id,
    sourceType: syncEntry.sourceType,
    sourceId: syncEntry.sourceId,
    siteId: syncEntry.siteId,
    externalIds: syncEntry.externalIds ?? [],
    status: syncEntry.status,
    syncedAt: syncEntry.syncedAt,
    lastError: syncEntry.lastError,
    createdAt: syncEntry.createdAt,
    updatedAt: syncEntry.updatedAt,
  }
}
