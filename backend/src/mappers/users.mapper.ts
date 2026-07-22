import type { UserAccessScopesDTO, UserDTO } from '@remnant/shared'
import type { UserAccessDB, UserDB } from '@/types'

export function mapUserAccessToScopes(access?: UserAccessDB | null): UserAccessScopesDTO {
  if (access == null) {
    return {
      warehouses: [],
      sites: [],
      expenseCategories: [],
      cashregisters: [],
      cashregisterAccounts: [],
      deliveryServices: [],
      orderSources: [],
      orderStatuses: [],
    }
  }

  return {
    warehouses: access.warehouses ?? [],
    sites: access.sites ?? [],
    expenseCategories: access.expenseCategories ?? [],
    cashregisters: access.cashregisters ?? [],
    cashregisterAccounts: access.cashregisterAccounts ?? [],
    deliveryServices: access.deliveryServices ?? [],
    orderSources: access.orderSources ?? [],
    orderStatuses: access.orderStatuses ?? [],
  }
}

export function mapUserToDTO(user: UserDB, access?: UserAccessDB | null): UserDTO {
  return {
    id: user._id,
    seq: user.seq,
    login: user.login,
    name: user.name,
    password: user.password,
    role: user.role,
    active: user.active,
    access: mapUserAccessToScopes(access),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
