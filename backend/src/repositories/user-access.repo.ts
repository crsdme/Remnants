import type { UserAccessScopesDTO } from '@remnant/shared'
import type { UserAccessDB } from '@/types'
import { mapUserAccessToScopes } from '@/mappers/users.mapper'
import { UserAccessModel } from '@/models/user-access.model'
import { HttpError } from '@/utils/httpError'

function normalizeScopes(access?: Partial<UserAccessScopesDTO>): UserAccessScopesDTO {
  return {
    warehouseIds: access?.warehouseIds ?? [],
    siteIds: access?.siteIds ?? [],
    expenseCategoryIds: access?.expenseCategoryIds ?? [],
    cashregisterIds: access?.cashregisterIds ?? [],
    cashregisterAccountIds: access?.cashregisterAccountIds ?? [],
    deliveryServiceIds: access?.deliveryServiceIds ?? [],
    orderSourceIds: access?.orderSourceIds ?? [],
    orderStatusIds: access?.orderStatusIds ?? [],
  }
}

export async function findByUserId(userId: string): Promise<UserAccessDB | null> {
  return UserAccessModel.findOne({ userId }).lean().exec() as Promise<UserAccessDB | null>
}

/** Loads user resource scopes. Missing doc → all empty arrays (no access). */
export async function getScopesByUserId(userId: string): Promise<UserAccessScopesDTO> {
  const access = await findByUserId(userId)
  return mapUserAccessToScopes(access)
}

export async function createForUser(userId: string, access?: Partial<UserAccessScopesDTO>): Promise<UserAccessDB> {
  const scopes = normalizeScopes(access)
  const doc = await UserAccessModel.create({ userId, ...scopes })
  return doc.toObject() as UserAccessDB
}

export async function upsertForUser(userId: string, access?: Partial<UserAccessScopesDTO>): Promise<UserAccessDB> {
  const scopes = normalizeScopes(access)

  const doc = await UserAccessModel.findOneAndUpdate(
    { userId },
    { $set: scopes },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean().exec()

  if (doc == null) {
    throw new HttpError(400, 'User access not saved', 'USER_ACCESS_NOT_SAVED')
  }

  return doc as UserAccessDB
}
