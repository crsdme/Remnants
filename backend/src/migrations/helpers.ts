import type {
  AnyBulkWriteOperation,
  Collection,
  CreateIndexesOptions,
  Db,
  Document,
  IndexSpecification,
} from 'mongodb'
import { toMinor } from '@/utils/money'

export interface IndexSpec {
  key: IndexSpecification
  options?: CreateIndexesOptions
}

/** Idempotent: createIndex is a no-op when an equivalent index already exists. */
export async function ensureIndexes(
  collection: Collection<Document>,
  indexes: IndexSpec[],
  log: (message: string) => void,
): Promise<void> {
  for (const index of indexes) {
    await collection.createIndex(index.key, index.options)
  }
  if (indexes.length)
    log(`  indexes on ${collection.collectionName}: ${indexes.length}`)
}

export type CurrencyScaleMap = Map<string, number>

export async function loadCurrencyScales(db: Db): Promise<CurrencyScaleMap> {
  const currencies = await db.collection('currencies')
    .find({}, { projection: { _id: 1, scale: 1 } })
    .toArray()

  return new Map(
    currencies.map(doc => [String(doc._id), typeof doc.scale === 'number' ? doc.scale : 2]),
  )
}

export function getScale(scales: CurrencyScaleMap, currencyId: unknown, fallback = 2): number {
  if (typeof currencyId !== 'string' || !currencyId)
    return fallback
  return scales.get(currencyId) ?? fallback
}

export function toMinorSafe(amount: unknown, scale: number): number | null {
  if (typeof amount !== 'number' || Number.isNaN(amount))
    return null
  return toMinor(amount, scale)
}

/** Rename fields only when old exists and new does not. Then drop leftover old fields. */
export async function renameFields(
  collection: Collection<Document>,
  renames: Record<string, string>,
  log: (message: string) => void,
): Promise<void> {
  for (const [from, to] of Object.entries(renames)) {
    const renamed = await collection.updateMany(
      { [from]: { $exists: true }, [to]: { $exists: false } },
      { $rename: { [from]: to } },
    )
    const cleaned = await collection.updateMany(
      { [from]: { $exists: true }, [to]: { $exists: true } },
      { $unset: { [from]: 1 } },
    )
    if (renamed.modifiedCount || cleaned.modifiedCount) {
      log(`  $rename ${from} → ${to}: renamed=${renamed.modifiedCount}, cleaned=${cleaned.modifiedCount}`)
    }
  }
}

export async function setDefaultWhereMissing(
  collection: Collection<Document>,
  field: string,
  value: unknown,
  log: (message: string) => void,
): Promise<void> {
  const result = await collection.updateMany(
    { [field]: { $exists: false } },
    { $set: { [field]: value } },
  )
  if (result.modifiedCount)
    log(`  default ${field}=${JSON.stringify(value)}: ${result.modifiedCount}`)
}

interface MoneyFieldSpec {
  from: string
  to: string
  /** Field holding currency id before/after rename (prefer old name if still present). */
  currencyFrom: string
  currencyTo?: string
}

/**
 * Convert major money fields to minor and rename in one pass.
 * Idempotent: skips docs that already have `to` and no longer have `from`.
 */
export async function convertMoneyFields(
  collection: Collection<Document>,
  scales: CurrencyScaleMap,
  fields: MoneyFieldSpec[],
  log: (message: string) => void,
  batchSize = 500,
): Promise<void> {
  const orFilter = fields.map(f => ({
    [f.from]: { $exists: true },
  }))

  const cursor = collection.find({ $or: orFilter })
  let ops: AnyBulkWriteOperation<Document>[] = []
  let converted = 0

  const flush = async () => {
    if (!ops.length)
      return
    await collection.bulkWrite(ops, { ordered: false })
    converted += ops.length
    ops = []
  }

  for await (const doc of cursor) {
    const $set: Record<string, unknown> = {}
    const $unset: Record<string, 1> = {}

    for (const field of fields) {
      const hasFrom = Object.prototype.hasOwnProperty.call(doc, field.from)
      if (!hasFrom)
        continue

      const hasTo = doc[field.to] != null
      if (hasTo) {
        $unset[field.from] = 1
        continue
      }

      const currencyId = doc[field.currencyFrom] ?? (field.currencyTo ? doc[field.currencyTo] : undefined)
      const scale = getScale(scales, currencyId)
      const minor = toMinorSafe(doc[field.from], scale)

      if (minor == null) {
        log(`  warn: skip money ${field.from} on ${String(doc._id)} (invalid amount)`)
        continue
      }

      $set[field.to] = minor
      $unset[field.from] = 1
    }

    if (!Object.keys($set).length && !Object.keys($unset).length)
      continue

    const update: Document = {}
    if (Object.keys($set).length)
      update.$set = $set
    if (Object.keys($unset).length)
      update.$unset = $unset

    ops.push({
      updateOne: {
        filter: { _id: doc._id },
        update,
      },
    })

    if (ops.length >= batchSize)
      await flush()
  }

  await flush()
  if (converted)
    log(`  money convert: ${converted} docs`)
}

/** Assign sequential seq starting at 1 for docs missing seq or with seq=0. Updates counter. */
export async function backfillSeq(
  db: Db,
  collectionName: string,
  counterId: string,
  log: (message: string) => void,
): Promise<void> {
  const collection = db.collection(collectionName)
  const docs = await collection
    .find({ $or: [{ seq: { $exists: false } }, { seq: 0 }, { seq: null }] })
    .project({ _id: 1 })
    .sort({ createdAt: 1, _id: 1 })
    .toArray()

  if (!docs.length)
    return

  const maxDoc = await collection
    .find({ seq: { $gt: 0 } })
    .project({ seq: 1 })
    .sort({ seq: -1 })
    .limit(1)
    .toArray()
  let next = (maxDoc[0]?.seq as number | undefined) ?? 0

  const ops = docs.map((doc) => {
    next += 1
    return {
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { seq: next } },
      },
    }
  })

  await collection.bulkWrite(ops, { ordered: true })
  await db.collection<{ _id: string, seq: number }>('counters').updateOne(
    { _id: counterId },
    { $max: { seq: next }, $setOnInsert: { _id: counterId } },
    { upsert: true },
  )
  log(`  backfill seq on ${collectionName}: ${docs.length} (max=${next})`)
}
