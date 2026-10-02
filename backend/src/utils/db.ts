import type { ClientSession } from 'mongoose'
import mongoose from 'mongoose'

/** Opaque DB session for multi-write atomicity. Today: Mongo `ClientSession`. */
export type DbSession = ClientSession

type TransactionCallback<T> = (__session: DbSession) => Promise<T>

/**
 * Run `fn` inside a DB transaction. Prefer this over raw `mongoose.startSession`
 * so call sites stay DB-agnostic.
 */
export async function withTransaction<T>(fn: TransactionCallback<T>): Promise<T> {
  const session = await mongoose.startSession()
  try {
    let result!: T
    await session.withTransaction(async () => {
      result = await fn(session)
    })
    return result
  }
  finally {
    await session.endSession()
  }
}
