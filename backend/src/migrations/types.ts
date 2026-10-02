export interface MigrationRecord {
  id: string
  name: string
  appliedAt: Date
}

export interface MigrationStore {
  ensureReady: () => Promise<void>
  listApplied: () => Promise<MigrationRecord[]>
  markApplied: (__id: string, __name: string) => Promise<void>
}

export interface MigrationContext {
  db: import('mongodb').Db
  log: (__message: string) => void
}

export interface Migration {
  id: string
  name: string
  up: (__ctx: MigrationContext) => Promise<void>
}
