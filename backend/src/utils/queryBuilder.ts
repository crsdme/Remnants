/**
 * Builds MongoDB-style filter and sort objects from HTTP/query payload shapes.
 */

/** Single field participating in a {@link FilterRule} of type `multiFieldSearch`. */
export interface MultiFieldSearchSpec {
  field: string
  langAware?: boolean
  isArray?: boolean
  isArrayPrimitive?: boolean
}

/** How a filter key maps to a Mongo condition. */
export type FilterRule = { type: 'string', field?: string, langAware?: boolean }
  | { type: 'array', field?: string }
  | { type: 'exact', field?: string }
  | { type: 'number', field?: string }
  | { type: 'dateRange', field?: string }
  | { type: 'multiFieldSearch', field?: string, multiFields: MultiFieldSearchSpec[] }

export interface BuildQueryOptions {
  filters: Record<string, unknown>
  rules: Record<string, FilterRule>
  language?: string
  /** When true (default), adds `removed: false` unless overridden by batch ids. */
  removed?: boolean
  batch?: { ids: string[] }
}

/** Mongo filter document; `$and` is typed so branches can be pushed safely. */
export type MongoQuery = Record<string, any> & {
  $and?: MongoQuery[]
}

const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g

/** Escapes a string for safe use inside a Mongo `$regex` pattern. */
export function escapeRegex(value: string): string {
  return value.replace(REGEX_SPECIALS, '\\$&')
}

function isBlankFilter(value: unknown): boolean {
  return value === undefined || value === ''
}

function langPath(field: string, langAware: boolean | undefined, language: string): string {
  return langAware ? `${field}.${language}` : field
}

function caseInsensitiveRegex(term: string) {
  return { $regex: escapeRegex(term), $options: 'i' }
}

function multiFieldBranch(
  spec: MultiFieldSearchSpec,
  term: string,
  language: string,
): MongoQuery {
  const path = langPath(spec.field, spec.langAware, language)
  const regex = caseInsensitiveRegex(term)
  const { isArray = false, isArrayPrimitive = false } = spec

  if (isArray && !isArrayPrimitive) {
    const [arrayRoot, ...subParts] = path.split('.')
    const subField = subParts.join('.')
    return {
      [arrayRoot]: {
        $elemMatch: { [subField]: regex },
      },
    }
  }

  if (isArray && isArrayPrimitive)
    return { [path]: { $elemMatch: regex } }

  return { [path]: regex }
}

function applyStringRule(query: MongoQuery, field: string, langAware: boolean | undefined, language: string, raw: unknown) {
  query[langPath(field, langAware, language)] = caseInsensitiveRegex(String(raw))
}

function applyArrayRule(query: MongoQuery, field: string, raw: unknown) {
  if (Array.isArray(raw) && raw.length > 0)
    query[field] = { $in: raw }
}

function applyMultiFieldSearch(
  query: MongoQuery,
  rule: Extract<FilterRule, { type: 'multiFieldSearch' }>,
  raw: unknown,
  language: string,
) {
  const terms = String(raw).trim().toLowerCase().split(/\s+/)
  const branches = terms.map(term => ({
    $or: rule.multiFields.map(spec => multiFieldBranch(spec, term, language)),
  }))

  if (!query.$and)
    query.$and = []
  query.$and.push(...branches)
}

function applyRule(
  query: MongoQuery,
  filterKey: string,
  rule: FilterRule,
  raw: unknown,
  language: string,
) {
  const field = rule.field ?? filterKey

  switch (rule.type) {
    case 'string':
      applyStringRule(query, field, rule.langAware, language, raw)
      break
    case 'array':
      applyArrayRule(query, field, raw)
      break
    case 'exact':
      query[field] = raw
      break
    case 'number':
      query[field] = Number(raw)
      break
    case 'dateRange': {
      const range = raw as { from?: unknown, to?: unknown }
      if (Boolean(range.from) && Boolean(range.to)) {
        query[field] = {
          $gte: new Date(range.from as string | number | Date),
          $lte: new Date(range.to as string | number | Date),
        }
      }
      break
    }
    case 'multiFieldSearch':
      applyMultiFieldSearch(query, rule, raw, language)
      break
  }
}

/**
 * Turns `filters` + declarative `rules` into a Mongo filter.
 * If `batch.ids` is set, the result is only `{ _id: { $in: ids } }` (same as before).
 */
export function buildQuery({
  filters,
  rules,
  language = 'en',
  removed = true,
  batch,
}: BuildQueryOptions): MongoQuery {
  if (batch?.ids)
    return { _id: { $in: batch.ids } }

  const query: MongoQuery = {}

  if (removed)
    query.removed = false

  for (const [key, rule] of Object.entries(rules)) {
    const value = filters[key]
    if (isBlankFilter(value))
      continue
    applyRule(query, key, rule, value, language)
  }

  return query
}

function normalizeSortDirection(value: unknown): number {
  if (value === 'asc')
    return 1
  if (value === 'desc')
    return -1
  return value as number
}

function isNestedSortObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function flattenSort(
  obj: Record<string, unknown>,
  parentKey = '',
): Record<string, number> {
  const out: Record<string, number> = {}

  for (const [key, value] of Object.entries(obj)) {
    const path = parentKey ? `${parentKey}.${key}` : key

    if (isNestedSortObject(value))
      Object.assign(out, flattenSort(value, path))
    else
      out[path] = normalizeSortDirection(value)
  }

  return out
}

/**
 * Nested sort objects become dotted keys; `asc` / `desc` become `1` / `-1`.
 * Tie-breakers from `additionalSorters` override duplicate keys from `sort`.
 */
export function buildSortQuery(
  sort: Record<string, any> | undefined,
  defaultSorters: Record<string, any> = { _id: 1, id: 1 },
  additionalSorters: Record<string, any> = { _id: 1 },
): Record<string, any> {
  if (sort === undefined || sort === null || Object.keys(sort).length === 0)
    return defaultSorters

  return { ...flattenSort(sort), ...additionalSorters }
}
