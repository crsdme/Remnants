import type { SyncEntryDB, SyncEntryDTO } from '@/types'

export function mapSyncEntryToDTO(syncEntry: SyncEntryDB): SyncEntryDTO {
  return {
    id: syncEntry._id,
    sourceType: syncEntry.sourceType,
    sourceId: syncEntry.sourceId,
    site: syncEntry.site,
    externalId: syncEntry.externalId,
    status: syncEntry.status,
    syncedAt: syncEntry.syncedAt,
    lastError: syncEntry.lastError,
    createdAt: syncEntry.createdAt,
    updatedAt: syncEntry.updatedAt,
  }
}
