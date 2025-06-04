import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Status } from './common.type'

export interface UserRole extends Document {
  _id: string
  names: LanguageString
  permissions: string[]
  priority: number
  active: boolean
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

export interface getUserRolesParams {
  filters: {
    names: string
    permissions: string[]
    active: boolean[]
    priority: number
    createdAt: DateRange
    updatedAt: DateRange
  }
  sorters: {
    names: string
    permissions: string
    active: string
    priority: string
    updatedAt: string
    createdAt: string
  }
  pagination: Pagination
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
