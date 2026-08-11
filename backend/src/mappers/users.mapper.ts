import type { UserAccessScopesDTO, UserDTO } from '@remnant/shared'
import type { UserAccessDB, UserDB } from '@/types'

export function mapUserAccessToScopes(access?: UserAccessDB | null): UserAccessScopesDTO {
  if (access == null) {
    return {
      warehouseIds: [],
      siteIds: [],
      expenseCategoryIds: [],
      cashregisterIds: [],
      cashregisterAccountIds: [],
      deliveryServiceIds: [],
      orderSourceIds: [],
      orderStatusIds: [],
    }
  }

  return {
    warehouseIds: access.warehouseIds ?? [],
    siteIds: access.siteIds ?? [],
    expenseCategoryIds: access.expenseCategoryIds ?? [],
    cashregisterIds: access.cashregisterIds ?? [],
    cashregisterAccountIds: access.cashregisterAccountIds ?? [],
    deliveryServiceIds: access.deliveryServiceIds ?? [],
    orderSourceIds: access.orderSourceIds ?? [],
    orderStatusIds: access.orderStatusIds ?? [],
  }
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
