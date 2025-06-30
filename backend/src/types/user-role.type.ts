import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Sorter, Status } from './common.type'

export interface UserRole {
  id: IdType
  names: LanguageString
  permissions: string[]
  priority: number
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getUserRolesResult {
  status: Status
  code: Code
  message: Message
  userRoles: UserRole[]
  userRolesCount: number
}

export interface getUserRolesFilters {
  names: string
  permissions: string[]
  active: boolean[]
  priority: number
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getUserRolesSorters {
  names: Sorter
  permissions: Sorter
  active: Sorter
  priority: Sorter
  updatedAt: Sorter
  createdAt: Sorter
}

export interface getUserRolesParams {
  filters?: Partial<getUserRolesFilters>
  sorters?: Partial<getUserRolesSorters>
  pagination?: Partial<Pagination>
}

export interface createUserRoleResult {
  status: Status
  code: Code
  message: Message
  userRole: UserRole
}

export interface createUserRoleParams {
  names: LanguageString
  permissions: string[]
  priority: number
  active?: boolean
}

export interface editUserRoleResult {
  status: Status
  code: Code
  message: Message
  userRole: UserRole
}

export interface editUserRoleParams {
  id: IdType
  names: LanguageString
  permissions: string[]
  priority: number
  active?: boolean
}

export interface removeUserRolesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeUserRolesParams {
  ids: IdType[]
}

export interface importUserRolesResult {
  status: Status
  code: Code
  message: Message
}

export interface importUserRolesParams {
  file: Express.Multer.File
}

export interface duplicateUserRolesResult {
  status: Status
  code: Code
  message: Message
}

export interface duplicateUserRolesParams {
  ids: IdType[]
}
