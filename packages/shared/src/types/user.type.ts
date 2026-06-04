import type {
  IdType,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'
import type { UserRoleDTO } from './user-role.type'

export interface UserDTO {
  id: IdType
  login: string
  password?: string
  name: string
  role: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PopulatedUser extends Omit<UserDTO, 'role'> {
  _id: IdType
  role: UserRoleDTO
}

export type GetUsersResponse = ResponseList<UserDTO>

export type CreateUserResponse = ResponseItem<UserDTO>

export type EditUserResponse = ResponseItem<UserDTO>

export type RemoveUsersResponse = Response
