import type { UserAccessScopesDTO } from '../schemas/user-access.schema'

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    login: string
    name: string
    permissions: string[]
    access: UserAccessScopesDTO
    createdAt: Date
    updatedAt: Date
  } & {
    settings: {
      value: string
      key: string
    }[]
    permissions: string[]
  }
}

export interface RefreshResponse {
  accessToken: string
  permissions: string[]
  access: UserAccessScopesDTO
}
