import { z } from 'zod'
import { idSchema } from './common'

/** All cashregister-related actions live on accounts (cards). */
export const CASHREGISTER_CAPABILITIES = [
  'viewBalance',
  'transfer',
  'receive',
  'viewHistory',
  'sell',
  'viewExpenses',
  'viewStatistic',
] as const

export type CashregisterCapability = (typeof CASHREGISTER_CAPABILITIES)[number]

export const WAREHOUSE_CAPABILITIES = [
  'viewStock',
  'sell',
  'transfer',
  'receive',
  'viewHistory',
] as const

export type WarehouseCapability = (typeof WAREHOUSE_CAPABILITIES)[number]

export const cashregisterCapabilitySchema = z.enum(CASHREGISTER_CAPABILITIES)
export const warehouseCapabilitySchema = z.enum(WAREHOUSE_CAPABILITIES)

export const cashregisterAccountAccessEntrySchema = z.object({
  id: idSchema,
  capabilities: z.array(cashregisterCapabilitySchema).min(1),
})

/**
 * Cashregister is a UI/grouping container.
 * Real rights are on `accounts` (cards inside the register).
 */
export const cashregisterAccessEntrySchema = z.object({
  id: idSchema,
  accounts: z.array(cashregisterAccountAccessEntrySchema).min(1),
})

export const warehouseAccessEntrySchema = z.object({
  id: idSchema,
  capabilities: z.array(warehouseCapabilitySchema).min(1),
})

export type CashregisterAccountAccessEntryDTO = z.output<typeof cashregisterAccountAccessEntrySchema>
export type CashregisterAccessEntryDTO = z.output<typeof cashregisterAccessEntrySchema>
export type WarehouseAccessEntryDTO = z.output<typeof warehouseAccessEntrySchema>

/** Flat id-array scopes (not capability-based). */
export const USER_ACCESS_ID_SCOPE_KEYS = [
  'siteIds',
  'expenseCategoryIds',
  'cashregisterAccountIds',
  'deliveryServiceIds',
  'orderSourceIds',
  'orderStatusIds',
] as const

export type UserAccessIdScopeKey = (typeof USER_ACCESS_ID_SCOPE_KEYS)[number]

/** @deprecated Use USER_ACCESS_ID_SCOPE_KEYS + entity capability helpers */
export const USER_ACCESS_SCOPE_KEYS = [
  ...USER_ACCESS_ID_SCOPE_KEYS,
] as const

export type UserAccessScopeKey = UserAccessIdScopeKey

export const emptyUserAccessScopes = {
  warehouses: [] as WarehouseAccessEntryDTO[],
  cashregisters: [] as CashregisterAccessEntryDTO[],
  siteIds: [] as string[],
  expenseCategoryIds: [] as string[],
  cashregisterAccountIds: [] as string[],
  deliveryServiceIds: [] as string[],
  orderSourceIds: [] as string[],
  orderStatusIds: [] as string[],
}

export const userAccessScopesSchema = z.object({
  warehouses: z.array(warehouseAccessEntrySchema).default([]),
  cashregisters: z.array(cashregisterAccessEntrySchema).default([]),
  siteIds: z.array(idSchema).default([]),
  expenseCategoryIds: z.array(idSchema).default([]),
  /** Derived from cashregisters[].accounts — kept for list filters / backward compat */
  cashregisterAccountIds: z.array(idSchema).default([]),
  deliveryServiceIds: z.array(idSchema).default([]),
  orderSourceIds: z.array(idSchema).default([]),
  orderStatusIds: z.array(idSchema).default([]),
})

export type UserAccessScopesDTO = z.output<typeof userAccessScopesSchema>

export const userAccessSchema = userAccessScopesSchema.extend({
  id: idSchema,
  userId: idSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type UserAccessDTO = z.output<typeof userAccessSchema>

export type EntityAccessKind = 'warehouses' | 'cashregisters'

export function getEntityAccessIds(
  entries: Array<{ id: string }> | null | undefined,
): string[] {
  return (entries ?? []).map(entry => entry.id)
}

export function entityHasCapability(
  entries: Array<{ id: string, capabilities: string[] }> | null | undefined,
  entityId: string | null | undefined,
  capability: string,
): boolean {
  if (entityId == null || entityId === '')
    return false

  const entry = (entries ?? []).find(item => item.id === entityId)
  return entry?.capabilities.includes(capability) ?? false
}

export function getEntityIdsWithCapability(
  entries: Array<{ id: string, capabilities: string[] }> | null | undefined,
  capability: string,
): string[] {
  return (entries ?? [])
    .filter(entry => entry.capabilities.includes(capability))
    .map(entry => entry.id)
}

export function deriveCashregisterAccountIds(
  cashregisters: CashregisterAccessEntryDTO[] | null | undefined,
): string[] {
  return (cashregisters ?? []).flatMap(entry => entry.accounts.map(account => account.id))
}

export function flattenCashregisterAccounts(
  cashregisters: CashregisterAccessEntryDTO[] | null | undefined,
): Array<CashregisterAccountAccessEntryDTO & { cashregisterId: string }> {
  return (cashregisters ?? []).flatMap(entry =>
    entry.accounts.map(account => ({
      ...account,
      cashregisterId: entry.id,
    })),
  )
}

export function accountHasCapability(
  cashregisters: CashregisterAccessEntryDTO[] | null | undefined,
  accountId: string | null | undefined,
  capability: CashregisterCapability | string,
): boolean {
  if (accountId == null || accountId === '')
    return false

  return flattenCashregisterAccounts(cashregisters)
    .some(account => account.id === accountId && account.capabilities.includes(capability as CashregisterCapability))
}

export function getAccountIdsWithCapability(
  cashregisters: CashregisterAccessEntryDTO[] | null | undefined,
  capability: CashregisterCapability | string,
): string[] {
  return flattenCashregisterAccounts(cashregisters)
    .filter(account => account.capabilities.includes(capability as CashregisterCapability))
    .map(account => account.id)
}

/** Cashregisters that have at least one account with the capability. */
export function getCashregisterIdsWithAccountCapability(
  cashregisters: CashregisterAccessEntryDTO[] | null | undefined,
  capability: CashregisterCapability | string,
): string[] {
  return (cashregisters ?? [])
    .filter(entry => entry.accounts.some(account => account.capabilities.includes(capability as CashregisterCapability)))
    .map(entry => entry.id)
}

export function normalizeUserAccessScopes(
  access?: Partial<UserAccessScopesDTO> | null,
): UserAccessScopesDTO {
  const cashregisters = access?.cashregisters ?? []
  return {
    warehouses: access?.warehouses ?? [],
    cashregisters,
    siteIds: access?.siteIds ?? [],
    expenseCategoryIds: access?.expenseCategoryIds ?? [],
    cashregisterAccountIds: deriveCashregisterAccountIds(cashregisters),
    deliveryServiceIds: access?.deliveryServiceIds ?? [],
    orderSourceIds: access?.orderSourceIds ?? [],
    orderStatusIds: access?.orderStatusIds ?? [],
  }
}
