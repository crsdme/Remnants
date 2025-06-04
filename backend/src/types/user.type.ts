import type { Code, DateRange, IdType, Message, Pagination, Status } from './common.type'
import type { UserRole } from './user-role.type'

export interface User extends Document {
  _id: string
  login: string
  password?: string
  name: string
  role: string
  active: boolean
  createdAt: Date
  updatedAt: Date

  removeSensitiveData: (options: { exclude?: string[] }) => any
}

export interface PopulatedUser extends Omit<User, 'role'> {
  role: UserRole
}

export interface getUsersResult {
  status: Status
  code: Code
  message: Message
  users: User[]
  usersCount: number
}

export interface getUsersParams {
  filters: {
    name: string
    login: string
    role: string
    active: boolean[]
    createdAt: DateRange
    updatedAt: DateRange
  }
  sorters: {
    name: string
    login: string
    role: string
    active: string
    updatedAt: string
    createdAt: string
  }
  pagination: Pagination
}

export interface createUserResult {
  status: Status
  code: Code
  message: Message
  user: User
}

export interface createUserParams {
  name: string
  login: string
  password: string
  role: string
  active?: boolean
}

export interface editUserResult {
  status: Status
  code: Code
  message: Message
  user: User
}

export interface editUserParams {
  id: IdType
  name: string
  login: string
  password: string
  role: string
  active?: boolean
}

export interface removeUsersResult {
  status: Status
  code: Code
  message: Message
}

export interface removeUsersParams {
  ids: IdType[]
}

export interface importUsersResult {
  status: Status
  code: Code
  message: Message
}

export interface importUsersParams {
  file: Express.Multer.File
}

export interface duplicateUsersResult {
  status: Status
  code: Code
  message: Message
}

export interface duplicateUsersParams {
  ids: IdType[]
}
