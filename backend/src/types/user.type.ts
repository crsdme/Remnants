import type { Code, DateRange, IdType, Message, Pagination, Sorter, Status } from './common.type'
import type { UserRole } from './user-role.type'

export interface User {
  id: IdType
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
  _id: IdType
  role: UserRole
}

export interface getUsersResult {
  status: Status
  code: Code
  message: Message
  users: User[]
  usersCount: number
}

export interface getUsersFilters {
  name: string
  login: string
  role: string
  active: boolean[]
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getUsersSorters {
  name: Sorter
  login: Sorter
  role: Sorter
  active: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getUsersParams {
  filters?: Partial<getUsersFilters>
  sorters?: Partial<getUsersSorters>
  pagination?: Partial<Pagination>
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
