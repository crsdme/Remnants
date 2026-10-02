import type { UserAccessScopesDTO } from '@remnant/shared'
import { describe, expect, it } from 'vitest'
import { HttpError } from '@/utils/httpError'
import {
  assertAccountCapability,
  assertEntityCapability,
  assertEntityInAccess,
  getAccountIdsWithCapability,
  getEntityIds,
  getEntityIdsWithCapability,
  hasAccountCapability,
  hasEntityCapability,
} from '@/utils/scope'

const CR_A = '33333333-3333-3333-3333-333333333333'
const CR_B = '44444444-4444-4444-4444-444444444444'
const ACCOUNT_SELL = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const ACCOUNT_RECEIVE = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
const ACCOUNT_STATS = 'cccccccc-cccc-cccc-cccc-cccccccccccc'

const access: UserAccessScopesDTO = {
  warehouses: [
    { id: '11111111-1111-1111-1111-111111111111', capabilities: ['viewStock', 'transfer'] },
    { id: '22222222-2222-2222-2222-222222222222', capabilities: ['viewStock', 'receive', 'viewHistory'] },
  ],
  cashregisters: [
    {
      id: CR_A,
      accounts: [
        { id: ACCOUNT_SELL, capabilities: ['viewBalance', 'transfer', 'sell'] },
      ],
    },
    {
      id: CR_B,
      accounts: [
        { id: ACCOUNT_RECEIVE, capabilities: ['viewBalance', 'receive', 'viewHistory'] },
        { id: ACCOUNT_STATS, capabilities: ['viewBalance', 'viewExpenses', 'viewStatistic'] },
      ],
    },
  ],
  siteIds: [],
  expenseCategoryIds: [],
  cashregisterAccountIds: [],
  deliveryServiceIds: [],
  orderSourceIds: [],
  orderStatusIds: [],
}

describe('entity access capabilities', () => {
  it('lists all entity ids for visibility / destination', () => {
    expect(getEntityIds(access, 'warehouses')).toEqual([
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
    ])
  })

  it('lists ids with a specific capability', () => {
    expect(getEntityIdsWithCapability(access, 'warehouses', 'transfer')).toEqual([
      '11111111-1111-1111-1111-111111111111',
    ])
    expect(getEntityIdsWithCapability(access, 'cashregisters', 'receive')).toEqual([CR_B])
  })

  it('checks money capabilities on accounts, not the cashregister group', () => {
    expect(hasAccountCapability(access, ACCOUNT_SELL, 'sell')).toBe(true)
    expect(hasAccountCapability(access, ACCOUNT_SELL, 'viewHistory')).toBe(false)
    expect(hasAccountCapability(access, ACCOUNT_STATS, 'viewExpenses')).toBe(true)
    expect(hasAccountCapability(access, ACCOUNT_STATS, 'viewStatistic')).toBe(true)
    expect(hasAccountCapability(access, ACCOUNT_RECEIVE, 'viewStatistic')).toBe(false)

    expect(getAccountIdsWithCapability(access, 'viewHistory')).toEqual([ACCOUNT_RECEIVE])
    expect(getAccountIdsWithCapability(access, 'viewExpenses')).toEqual([ACCOUNT_STATS])
    expect(getEntityIdsWithCapability(access, 'cashregisters', 'viewStatistic')).toEqual([CR_B])

    expect(() => assertAccountCapability(access, ACCOUNT_SELL, 'receive')).toThrow(HttpError)
  })

  it('checks capability and denies missing ones', () => {
    expect(hasEntityCapability(
      access,
      'warehouses',
      '11111111-1111-1111-1111-111111111111',
      'transfer',
    )).toBe(true)

    expect(hasEntityCapability(
      access,
      'warehouses',
      '11111111-1111-1111-1111-111111111111',
      'receive',
    )).toBe(false)

    expect(() => assertEntityCapability(
      access,
      'warehouses',
      '22222222-2222-2222-2222-222222222222',
      'transfer',
    )).toThrow(HttpError)
  })

  it('allows destination when entity is in access without receive', () => {
    expect(() => assertEntityInAccess(
      access,
      'warehouses',
      '11111111-1111-1111-1111-111111111111',
    )).not.toThrow()
  })

  it('admin bypasses capability checks', () => {
    expect(hasEntityCapability(
      access,
      'warehouses',
      '11111111-1111-1111-1111-111111111111',
      'receive',
      { isAdmin: true },
    )).toBe(true)

    expect(getEntityIds(access, 'warehouses', { isAdmin: true })).toBeNull()
    expect(getEntityIdsWithCapability(access, 'cashregisters', 'sell', { isAdmin: true })).toBeNull()
  })

  it('empty warehouses still mean no entity access but do not imply product lock', () => {
    const emptyAccess: UserAccessScopesDTO = {
      ...access,
      warehouses: [],
    }

    expect(getEntityIds(emptyAccess, 'warehouses')).toEqual([])
    expect(getEntityIdsWithCapability(emptyAccess, 'warehouses', 'viewStock')).toEqual([])
    // Product CRUD must not use warehouse scope — empty list only hides stock/transfers.
    expect(emptyAccess.warehouses).toHaveLength(0)
  })
})
