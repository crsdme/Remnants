export interface MigrationRecord {
  id: string
  name: string
  appliedAt: Date
}

export interface MigrationStore {
  ensureReady: () => Promise<void>
  listApplied: () => Promise<MigrationRecord[]>
  markApplied: (id: string, name: string) => Promise<void>
}

export interface MigrationContext {
  db: import('mongodb').Db
  log: (message: string) => void
}

export interface Migration {
  id: string
  name: string
  up: (ctx: MigrationContext) => Promise<void>
}
