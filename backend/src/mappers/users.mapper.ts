import type { UserAccessScopesDTO, UserDTO } from '@remnant/shared'
import type { UserAccessDB, UserDB } from '@/types'
import { emptyUserAccessScopes, normalizeUserAccessScopes } from '@remnant/shared'

export function mapUserAccessToScopes(access?: UserAccessDB | null): UserAccessScopesDTO {
  if (access == null) {
    return { ...emptyUserAccessScopes }
  }

  return normalizeUserAccessScopes({
    warehouses: access.warehouses ?? [],
    cashregisters: access.cashregisters ?? [],
    siteIds: access.siteIds ?? [],
    expenseCategoryIds: access.expenseCategoryIds ?? [],
    cashregisterAccountIds: access.cashregisterAccountIds ?? [],
    deliveryServiceIds: access.deliveryServiceIds ?? [],
    orderSourceIds: access.orderSourceIds ?? [],
    orderStatusIds: access.orderStatusIds ?? [],
  })
}

export function mapUserToDTO(user: UserDB, access?: UserAccessDB | null): UserDTO {
  return {
    id: user._id,
    seq: user.seq,
    login: user.login,
    name: user.name,
    password: user.password,
    roleId: user.roleId,
    active: user.active,
    access: mapUserAccessToScopes(access),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
