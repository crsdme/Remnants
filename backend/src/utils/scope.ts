import type { AuthUser, UserAccessScopeKey, UserAccessScopesDTO } from '@remnant/shared'
import type { MongoQuery } from '@/utils/queryBuilder'
import { emptyUserAccessScopes } from '@remnant/shared'
import { HttpError } from '@/utils/httpError'

/**
 * Empty array = no access.
 * `other.admin` bypasses scope checks.
 * `scopeIds === null` = no restriction (admin / unrestricted).
 */
export function hasScopeAccess(
  access: UserAccessScopesDTO | null | undefined,
  scope: UserAccessScopeKey,
  resourceId: string | null | undefined,
  options: { isAdmin?: boolean } = {},
): boolean {
  if (options.isAdmin)
    return true

  if (resourceId == null || resourceId === '')
    return false

  const ids = access?.[scope] ?? emptyUserAccessScopes[scope]
  return ids.includes(resourceId)
}

export function assertScopeAccess(
  access: UserAccessScopesDTO | null | undefined,
  scope: UserAccessScopeKey,
  resourceId: string | null | undefined,
  options: { isAdmin?: boolean } = {},
): void {
  if (!hasScopeAccess(access, scope, resourceId, options)) {
    throw new HttpError(403, 'Access to resource denied', 'SCOPE_DENIED')
  }
}

export function getScopeIds(
  access: UserAccessScopesDTO | null | undefined,
  scope: UserAccessScopeKey,
  options: { isAdmin?: boolean } = {},
): string[] | null {
  if (options.isAdmin)
    return null

  return access?.[scope] ?? emptyUserAccessScopes[scope]
}

export function getScopeIdsForUser(
  access: UserAccessScopesDTO | null | undefined,
  scope: UserAccessScopeKey,
  user: Pick<AuthUser, 'permissions'>,
): string[] | null {
  return getScopeIds(access, scope, {
    isAdmin: user.permissions.includes('other.admin'),
  })
}

/** Returns Mongo `$in` filter, or `undefined` when admin (no restriction). */
export function getScopeMongoFilter(
  access: UserAccessScopesDTO | null | undefined,
  scope: UserAccessScopeKey,
  options: { isAdmin?: boolean } = {},
): { $in: string[] } | undefined {
  const ids = getScopeIds(access, scope, options)
  if (ids === null)
    return undefined

  return { $in: ids }
}

/**
 * Restricts `query[field]` to allowed scope ids.
 * - `null` / `undefined` → no change (unrestricted)
 * - `[]` → match nothing
 * - intersects with existing `$in` / exact string when present
 */
export function applyScopeIdsToQuery(
  query: MongoQuery,
  scopeIds: string[] | null | undefined,
  field = '_id',
): void {
  if (scopeIds == null)
    return

  const current: unknown = query[field]

  if (typeof current === 'string') {
    query[field] = scopeIds.includes(current) ? current : { $in: [] }
    return
  }

  const existingIn = getExistingInFilter(current)
  if (existingIn != null) {
    const allowed = new Set(scopeIds)
    query[field] = { $in: existingIn.filter(id => allowed.has(id)) }
    return
  }

  query[field] = { $in: scopeIds }
}

/**
 * Document must reference at least one of `fields` within scope
 * (e.g. warehouse transaction fromWarehouse / toWarehouse).
 */
export function applyScopeIdsToAnyOfFields(
  query: MongoQuery,
  scopeIds: string[] | null | undefined,
  fields: string[],
): void {
  if (scopeIds == null || fields.length === 0)
    return

  if (!query.$and)
    query.$and = []

  query.$and.push({
    $or: fields.map(field => ({ [field]: { $in: scopeIds } })),
  })
}

function getExistingInFilter(value: unknown): string[] | null {
  if (value == null || typeof value !== 'object')
    return null

  const maybeIn = (value as { $in?: unknown }).$in
  if (!Array.isArray(maybeIn))
    return null

  return maybeIn.filter((id): id is string => typeof id === 'string')
}

export function filterIdsByScope(
  access: UserAccessScopesDTO | null | undefined,
  scope: UserAccessScopeKey,
  resourceIds: string[],
  options: { isAdmin?: boolean } = {},
): string[] {
  if (options.isAdmin)
    return resourceIds

  const allowed = new Set(access?.[scope] ?? emptyUserAccessScopes[scope])
  return resourceIds.filter(id => allowed.has(id))
}
