import type { Migration } from '../types'
import type { Document } from 'mongodb'
import { backfillSeq, renameFields } from '../helpers'
import { v4 as uuidv4 } from 'uuid'

/**
 * Users: role → roleId, seq backfill.
 * Create empty user-accesses docs for users that do not have one yet.
 */
export const migration010UsersAndAccess: Migration = {
  id: '010',
  name: 'users_and_access',
  async up({ db, log }) {
    const users = db.collection('users')
    const accesses = db.collection('user-accesses')

    await renameFields(users, {
      role: 'roleId',
    }, log)

    await backfillSeq(db, 'users', 'users', log)

    const allUsers = await users
      .find({}, { projection: { _id: 1 } })
      .toArray()

    if (!allUsers.length) {
      log('  no users')
      return
    }

    const existing = await accesses
      .find({}, { projection: { userId: 1 } })
      .toArray()
    const existingUserIds = new Set(existing.map(doc => String(doc.userId)))

    const now = new Date()
    const toInsert = allUsers
      .filter(u => !existingUserIds.has(String(u._id)))
      .map(u => ({
        _id: uuidv4(),
        userId: String(u._id),
        warehouseIds: [],
        siteIds: [],
        expenseCategoryIds: [],
        cashregisterIds: [],
        cashregisterAccountIds: [],
        deliveryServiceIds: [],
        orderSourceIds: [],
        orderStatusIds: [],
        createdAt: now,
        updatedAt: now,
      }))

    if (toInsert.length) {
      await accesses.insertMany(toInsert as Document[], { ordered: false })
      log(`  created user-accesses: ${toInsert.length}`)
    }
    else {
      log('  user-accesses already present')
    }

    await accesses.createIndex({ userId: 1 }, { unique: true })
    log('  unique index userId ensured')
  },
}
