import type {
  IdType,
  LanguageString,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface UserRoleDTO {
  id: IdType
  names: LanguageString
  permissions: string[]
  priority: number
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetUserRolesResponse = ResponseList<UserRoleDTO>

export type CreateUserRoleResponse = ResponseItem<UserRoleDTO>

export type EditUserRoleResponse = ResponseItem<UserRoleDTO>

export type RemoveUserRolesResponse = Response
