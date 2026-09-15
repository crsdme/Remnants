import type {
  CashregisterCapability,
  EntityAccessKind,
  WarehouseCapability,
} from '@remnant/shared'
import {
  accountHasCapability,
  emptyUserAccessScopes,
  entityHasCapability,
  getAccountIdsWithCapability,
  getCashregisterIdsWithAccountCapability,
} from '@remnant/shared'
import { useAuthContext } from '@/contexts/AuthContext'
import { hasPermission } from '@/utils/helpers/permission'

type Capability = CashregisterCapability | WarehouseCapability

export function useEntityCapability(
  kind: EntityAccessKind,
  entityId: string | null | undefined,
  capability: Capability,
): boolean {
  const { permissions, access } = useAuthContext()

  if (hasPermission(permissions, 'other.admin'))
    return true

  if (kind === 'cashregisters') {
    return getCashregisterIdsWithAccountCapability(access?.cashregisters, capability as CashregisterCapability)
      .includes(entityId ?? '')
  }

  return entityHasCapability(access?.[kind] ?? emptyUserAccessScopes[kind], entityId, capability)
}

export function useEntityIdsWithCapability(
  kind: EntityAccessKind,
  capability: Capability,
): string[] | null {
  const { permissions, access } = useAuthContext()

  if (hasPermission(permissions, 'other.admin'))
    return null

  if (kind === 'cashregisters') {
    return getCashregisterIdsWithAccountCapability(access?.cashregisters, capability as CashregisterCapability)
  }

  return (access?.[kind] ?? [])
    .filter(entry => 'capabilities' in entry && entry.capabilities.includes(capability as never))
    .map(entry => entry.id)
}

export function useEntityAccessIds(kind: EntityAccessKind): string[] | null {
  const { permissions, access } = useAuthContext()

  if (hasPermission(permissions, 'other.admin'))
    return null

  return (access?.[kind] ?? []).map(entry => entry.id)
}

export function useAccountCapability(
  accountId: string | null | undefined,
  capability: CashregisterCapability,
): boolean {
  const { permissions, access } = useAuthContext()

  if (hasPermission(permissions, 'other.admin'))
    return true

  return accountHasCapability(access?.cashregisters, accountId, capability)
}

export function useAccountIdsWithCapability(
  capability: CashregisterCapability,
): string[] | null {
  const { permissions, access } = useAuthContext()

  if (hasPermission(permissions, 'other.admin'))
    return null

  return getAccountIdsWithCapability(access?.cashregisters, capability)
}
