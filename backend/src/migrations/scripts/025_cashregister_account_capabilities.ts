import type { Migration } from '../types'
import { CASHREGISTER_CAPABILITIES } from '@remnant/shared'

type LegacyCashregisterEntry = {
  id?: string
  capabilities?: string[]
  accounts?: Array<{ id?: string, capabilities?: string[] }>
}

/**
 * Move cashregister-level capabilities onto nested accounts (cards).
 * - Uses cashregister.accountIds from DB
 * - Intersects with cashregisterAccountIds when present
 * - Falls back to all register accounts when account scope is empty
 */
export const migration025CashregisterAccountCapabilities: Migration = {
  id: '025',
  name: 'cashregister_account_capabilities',
  async up({ db, log }) {
    const accesses = db.collection('user-accesses')
    const cashregisters = db.collection('cashregisters')

    const docs = await accesses.find({}).toArray()
    if (!docs.length) {
      log('  no user-accesses')
      return
    }

    const registerDocs = await cashregisters
      .find({}, { projection: { _id: 1, accountIds: 1 } })
      .toArray()

    const accountsByRegister = new Map<string, string[]>()
    for (const register of registerDocs) {
      const accountIds = Array.isArray(register.accountIds)
        ? register.accountIds.filter((id): id is string => typeof id === 'string')
        : []
      accountsByRegister.set(String(register._id), accountIds)
    }

    let updated = 0
    for (const doc of docs) {
      const scopedAccountIds = Array.isArray(doc.cashregisterAccountIds)
        ? doc.cashregisterAccountIds.filter((id): id is string => typeof id === 'string')
        : []
      const scopedSet = new Set(scopedAccountIds)

      const rawCashregisters = Array.isArray(doc.cashregisters)
        ? doc.cashregisters as LegacyCashregisterEntry[]
        : []

      const nextCashregisters = rawCashregisters
        .map((entry) => {
          const cashregisterId = typeof entry.id === 'string' ? entry.id : null
          if (!cashregisterId)
            return null

          const existingAccounts = Array.isArray(entry.accounts)
            ? entry.accounts
              .filter((account): account is { id: string, capabilities: string[] } =>
                typeof account?.id === 'string'
                && Array.isArray(account.capabilities)
                && account.capabilities.length > 0)
              .map(account => ({
                id: account.id,
                capabilities: account.capabilities.filter((cap): cap is typeof CASHREGISTER_CAPABILITIES[number] =>
                  (CASHREGISTER_CAPABILITIES as readonly string[]).includes(cap)),
              }))
              .filter(account => account.capabilities.length > 0)
            : []

          if (existingAccounts.length > 0) {
            return { id: cashregisterId, accounts: existingAccounts }
          }

          const legacyCaps = Array.isArray(entry.capabilities) && entry.capabilities.length > 0
            ? entry.capabilities.filter((cap): cap is typeof CASHREGISTER_CAPABILITIES[number] =>
                (CASHREGISTER_CAPABILITIES as readonly string[]).includes(cap))
            : [...CASHREGISTER_CAPABILITIES]

          if (legacyCaps.length === 0)
            return null

          const registerAccountIds = accountsByRegister.get(cashregisterId) ?? []
          const targetAccountIds = scopedSet.size > 0
            ? registerAccountIds.filter(id => scopedSet.has(id))
            : registerAccountIds

          if (targetAccountIds.length === 0)
            return null

          return {
            id: cashregisterId,
            accounts: targetAccountIds.map(id => ({
              id,
              capabilities: [...legacyCaps],
            })),
          }
        })
        .filter((entry): entry is Exclude<typeof entry, null> => entry != null)

      const derivedAccountIds = nextCashregisters.flatMap(entry => entry.accounts.map(account => account.id))

      await accesses.updateOne(
        { _id: doc._id },
        {
          $set: {
            cashregisters: nextCashregisters,
            cashregisterAccountIds: derivedAccountIds,
            updatedAt: new Date(),
          },
        },
      )
      updated += 1
    }

    log(`  migrated cashregister account capabilities: ${updated}`)
  },
}
