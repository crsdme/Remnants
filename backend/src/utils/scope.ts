import type {
  AuthUser,
  CashregisterCapability,
  EntityAccessKind,
  UserAccessIdScopeKey,
  UserAccessScopesDTO,
  WarehouseCapability,
} from '@remnant/shared'
import type { MongoQuery } from '@/utils/queryBuilder'
import {
  accountHasCapability as accountHasCapabilityShared,
  emptyUserAccessScopes,
  entityHasCapability,
  getAccountIdsWithCapability as getAccountIdsWithCapShared,
  getCashregisterIdsWithAccountCapability as getCashregisterIdsWithAccountCapShared,
  getEntityAccessIds,
  getEntityIdsWithCapability as getIdsWithCapFromEntries,
} from '@remnant/shared'
import { HttpError } from '@/utils/httpError'

type EntityCapability = CashregisterCapability | WarehouseCapability
type AccountCapability = CashregisterCapability

function isAdminUser(user: Pick<AuthUser, 'permissions'> | { isAdmin?: boolean } | undefined): boolean {
  if (!user)
    return false
  if ('isAdmin' in user && user.isAdmin)
    return true
  if ('permissions' in user && Array.isArray(user.permissions))
    return user.permissions.includes('other.admin')
  return false
}

/**
 * Empty array = no access.
 * `other.admin` bypasses scope checks.
 * `scopeIds === null` = no restriction (admin / unrestricted).
 */
export function hasScopeAccess(
  access: UserAccessScopesDTO | null | undefined,
  scope: UserAccessIdScopeKey,
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
  scope: UserAccessIdScopeKey,
  resourceId: string | null | undefined,
  options: { isAdmin?: boolean } = {},
): void {
  if (!hasScopeAccess(access, scope, resourceId, options)) {
    throw new HttpError(403, 'Access to resource denied', 'SCOPE_DENIED')
  }
}

export function getScopeIds(
  access: UserAccessScopesDTO | null | undefined,
  scope: UserAccessIdScopeKey,
  options: { isAdmin?: boolean } = {},
): string[] | null {
  if (options.isAdmin)
    return null

  return access?.[scope] ?? emptyUserAccessScopes[scope]
}

export function getScopeIdsForUser(
  access: UserAccessScopesDTO | null | undefined,
  scope: UserAccessIdScopeKey,
  user: Pick<AuthUser, 'permissions'>,
): string[] | null {
  return getScopeIds(access, scope, {
    isAdmin: user.permissions.includes('other.admin'),
  })
}

export function getEntityIds(
  access: UserAccessScopesDTO | null | undefined,
  kind: EntityAccessKind,
  options: { isAdmin?: boolean } = {},
): string[] | null {
  if (options.isAdmin)
    return null

  return getEntityAccessIds(access?.[kind])
}

export function getEntityIdsForUser(
  access: UserAccessScopesDTO | null | undefined,
  kind: EntityAccessKind,
  user: Pick<AuthUser, 'permissions'>,
): string[] | null {
  return getEntityIds(access, kind, {
    isAdmin: isAdminUser(user),
  })
}

export function hasEntityCapability(
  access: UserAccessScopesDTO | null | undefined,
  kind: EntityAccessKind,
  entityId: string | null | undefined,
  capability: EntityCapability,
  options: { isAdmin?: boolean } = {},
): boolean {
  if (options.isAdmin)
    return true

  if (kind === 'cashregisters') {
    return getCashregisterIdsWithAccountCapShared(access?.cashregisters, capability).includes(entityId ?? '')
  }

  return entityHasCapability(access?.[kind], entityId, capability)
}

export function assertEntityCapability(
  access: UserAccessScopesDTO | null | undefined,
  kind: EntityAccessKind,
  entityId: string | null | undefined,
  capability: EntityCapability,
  options: { isAdmin?: boolean } = {},
): void {
  if (!hasEntityCapability(access, kind, entityId, capability, options)) {
    throw new HttpError(403, 'Access to resource denied', 'SCOPE_DENIED')
  }
}

export function getEntityIdsWithCapability(
  access: UserAccessScopesDTO | null | undefined,
  kind: EntityAccessKind,
  capability: EntityCapability,
  options: { isAdmin?: boolean } = {},
): string[] | null {
  if (options.isAdmin)
    return null

  if (kind === 'cashregisters') {
    return getCashregisterIdsWithAccountCapShared(access?.cashregisters, capability)
  }

  return getIdsWithCapFromEntries(access?.[kind], capability)
}

export function getEntityIdsWithCapabilityForUser(
  access: UserAccessScopesDTO | null | undefined,
  kind: EntityAccessKind,
  capability: EntityCapability,
  user: Pick<AuthUser, 'permissions'>,
): string[] | null {
  return getEntityIdsWithCapability(access, kind, capability, {
    isAdmin: isAdminUser(user),
  })
}

export function hasAccountCapability(
  access: UserAccessScopesDTO | null | undefined,
  accountId: string | null | undefined,
  capability: AccountCapability,
  options: { isAdmin?: boolean } = {},
): boolean {
  if (options.isAdmin)
    return true

  return accountHasCapabilityShared(access?.cashregisters, accountId, capability)
}

export function assertAccountCapability(
  access: UserAccessScopesDTO | null | undefined,
  accountId: string | null | undefined,
  capability: AccountCapability,
  options: { isAdmin?: boolean } = {},
): void {
  if (!hasAccountCapability(access, accountId, capability, options)) {
    throw new HttpError(403, 'Access to resource denied', 'SCOPE_DENIED')
  }
}

export function getAccountIdsWithCapability(
  access: UserAccessScopesDTO | null | undefined,
  capability: AccountCapability,
  options: { isAdmin?: boolean } = {},
): string[] | null {
  if (options.isAdmin)
    return null

  return getAccountIdsWithCapShared(access?.cashregisters, capability)
}

export function getAccountIdsWithCapabilityForUser(
  access: UserAccessScopesDTO | null | undefined,
  capability: AccountCapability,
  user: Pick<AuthUser, 'permissions'>,
): string[] | null {
  return getAccountIdsWithCapability(access, capability, {
    isAdmin: isAdminUser(user),
  })
}

export function assertEntityInAccess(
  access: UserAccessScopesDTO | null | undefined,
  kind: EntityAccessKind,
  entityId: string | null | undefined,
  options: { isAdmin?: boolean } = {},
): void {
  if (options.isAdmin)
    return

  if (entityId == null || entityId === '') {
    throw new HttpError(403, 'Access to resource denied', 'SCOPE_DENIED')
  }

  const ids = getEntityAccessIds(access?.[kind])
  if (!ids.includes(entityId)) {
    throw new HttpError(403, 'Access to resource denied', 'SCOPE_DENIED')
  }
}

/** Returns Mongo `$in` filter, or `undefined` when admin (no restriction). */
export function getScopeMongoFilter(
  access: UserAccessScopesDTO | null | undefined,
  scope: UserAccessIdScopeKey,
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
  scope: UserAccessIdScopeKey,
  resourceIds: string[],
  options: { isAdmin?: boolean } = {},
): string[] {
  if (options.isAdmin)
    return resourceIds

  const allowed = new Set(access?.[scope] ?? emptyUserAccessScopes[scope])
  return resourceIds.filter(id => allowed.has(id))
}
