import { isEqual, isPlainObject } from 'lodash'

export function getDifference(oldObj: Record<string, unknown>, newObj: Record<string, unknown>) {
  const diff: Record<string, unknown> = {}

  for (const key of Object.keys(newObj)) {
    if (typeof newObj[key] === 'undefined')
      continue

    if (!isEqual(oldObj[key], newObj[key])) {
      diff[key] = newObj[key]
    }
  }

  return diff
}

export function getDifferenceDeep(prev: Record<string, unknown>, next: Record<string, unknown>) {
  if (isEqual(prev, next))
    return Array.isArray(prev) ? [] : {}

  if (Array.isArray(prev) || Array.isArray(next)) {
    if (typeof next === 'undefined')
      return Array.isArray(prev) ? [] : {}
    return next
  }

  if (!isPlainObject(prev) || !isPlainObject(next)) {
    return next
  }

  const result: Record<string, unknown> = {}
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)])

  for (const key of keys) {
    const a = prev[key]
    const b = next[key]

    if (!(key in next))
      continue

    if (!isEqual(a, b)) {
      if (Array.isArray(a) || Array.isArray(b)) {
        result[key] = b
      }
      else if (isPlainObject(a) && isPlainObject(b)) {
        const nested = getDifferenceDeep(a as Record<string, unknown>, b as Record<string, unknown>)
        if (Array.isArray(nested)) {
          result[key] = b
        }
        else if (Object.keys(nested).length) {
          result[key] = nested
        }
      }
      else {
        result[key] = b
      }
    }
  }

  return result
}

export interface AuditChange {
  path: string
  before: unknown
  after: unknown
}

const DEFAULT_AUDIT_OMIT = new Set([
  '_id',
  'id',
  '__v',
  'createdAt',
  'updatedAt',
  'removed',
  'seq',
])

function getByPath(obj: unknown, path: string) {
  if (!path)
    return obj
  return path.split('.').reduce((o, k) => (o == null ? o : o[k as keyof typeof o]), obj)
}

function normalizeAuditValue(value: unknown, omit: Set<string>): unknown {
  if (value == null)
    return value

  if (value instanceof Date)
    return value.toISOString()

  if (value instanceof Map) {
    return Object.fromEntries(
      [...value.entries()].map(([key, nested]) => [String(key), normalizeAuditValue(nested, omit)]),
    )
  }

  if (Array.isArray(value))
    return value.map(item => normalizeAuditValue(item, omit))

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {}
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (omit.has(key))
        continue
      result[key] = normalizeAuditValue(nested, omit)
    }
    return result
  }

  return value
}

/** Plain JSON-ish snapshot of any entity doc/payload for audit diffs. */
export function toAuditSnapshot(
  value: unknown,
  options?: { omit?: Iterable<string> },
): Record<string, unknown> {
  const omit = new Set([...DEFAULT_AUDIT_OMIT, ...(options?.omit ?? [])])
  const normalized = normalizeAuditValue(value, omit)
  return isPlainObject(normalized) ? normalized as Record<string, unknown> : {}
}

export function diffToChangesFromDeep(prev: Record<string, unknown>, next: Record<string, unknown>): AuditChange[] {
  const diff = getDifferenceDeep(prev, next)
  const changes: AuditChange[] = []

  const walk = (node: unknown, basePath: string) => {
    if (!isPlainObject(node)) {
      if (!basePath)
        return
      changes.push({
        path: basePath,
        before: getByPath(prev, basePath),
        after: getByPath(next, basePath),
      })
      return
    }

    for (const key of Object.keys(node as Record<string, unknown>)) {
      const child = (node as Record<string, unknown>)[key]
      const path = basePath ? `${basePath}.${key}` : key

      if (isPlainObject(child)) {
        walk(child, path)
      }
      else {
        changes.push({
          path,
          before: getByPath(prev, path),
          after: getByPath(next, path),
        })
      }
    }
  }

  walk(diff, '')
  return changes
}

/** Universal create/edit/remove audit changes from before/after snapshots. */
export function buildAuditChanges(
  before: unknown,
  after: unknown,
  options?: { omit?: Iterable<string> },
): AuditChange[] {
  const prev = toAuditSnapshot(before, options)
  const next = toAuditSnapshot(after, options)

  if (Object.keys(next).length === 0 && Object.keys(prev).length > 0) {
    return Object.entries(prev).map(([path, value]) => ({
      path,
      before: value,
      after: null,
    }))
  }

  return diffToChangesFromDeep(prev, next)
}
