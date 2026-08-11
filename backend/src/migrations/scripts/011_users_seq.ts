import type { Migration } from '../types'

import { backfillSeq } from '../helpers'

/** Backfill seq on users (for DBs that already applied 010 without seq). */

export const migration011UsersSeq: Migration = {

  id: '011',

  name: 'users_seq',

  async up({ db, log }) {
    await backfillSeq(db, 'users', 'users', log)
  },

}
