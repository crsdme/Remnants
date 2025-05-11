import type { User } from '../models/user.model'
import type { Code, DateRange, IdType, Message, Pagination, Status } from './common.type'

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
    active: boolean[]
    createdAt: DateRange
    updatedAt: DateRange
  }
  sorters: {
    name: string
    login: string
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
  active?: boolean
}

export interface editUserResult {
  status: Status
  code: Code
  message: Message
  user: User
}

export interface editUserParams {
  _id: IdType
  name: string
  login: string
  password: string
  active?: boolean
}

export interface removeUsersResult {
  status: Status
  code: Code
  message: Message
}

export interface removeUsersParams {
  _ids: IdType[]
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
  _ids: IdType[]
}
