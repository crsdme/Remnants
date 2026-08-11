import type { Migration, MigrationContext, MigrationStore } from './types'

export async function runMigrations(
  store: MigrationStore,
  migrations: Migration[],
  ctx: MigrationContext,
): Promise<void> {
  await store.ensureReady()

  const applied = new Set((await store.listApplied()).map(r => r.id))
  const ordered = [...migrations].sort((a, b) => a.id.localeCompare(b.id))

  let ran = 0
  for (const migration of ordered) {
    if (applied.has(migration.id)) {
      ctx.log(`skip  ${migration.id}_${migration.name}`)
      continue
    }

    ctx.log(`apply ${migration.id}_${migration.name}`)
    await migration.up(ctx)
    await store.markApplied(migration.id, migration.name)
    ran += 1
    ctx.log(`done  ${migration.id}_${migration.name}`)
  }

  if (!ran)
    ctx.log('No pending migrations')
  else
    ctx.log(`Applied ${ran} migration(s)`)
}
