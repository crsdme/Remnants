import type { Migration } from '../types'
import { ensureIndexes } from '../helpers'

export const migration021SyncEntrySiteLinkUnique: Migration = {
  id: '021',
  name: 'sync_entry_site_link_unique',
  async up({ db, log }) {
    await ensureIndexes(db.collection('sync-entries'), [
      {
        key: { siteId: 1, sourceType: 1, sourceId: 1 },
        options: { unique: true, name: 'siteId_1_sourceType_1_sourceId_1' },
      },
    ], log)
  },
}
