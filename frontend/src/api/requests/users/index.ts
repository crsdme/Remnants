import { api } from '@/api/instance'

export interface getUsersParams {
  filters: {
    name?: string
    login?: string
    active?: boolean[]
    createdAt?: {
      from?: Date
      to?: Date
    }
    updatedAt?: {
      from?: Date
      to?: Date
    }
  }
  sorters?: {
    name?: number
    login?: number
    active?: number
    createdAt?: number
    updatedAt?: number
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export async function getUsers(params: getUsersParams) {
  return api.get<UsersResponse>('users/get', { params })
}

export interface createUsersParams {
  name: string
  login: string
  password: string
  active?: boolean
}

export async function createUser(params: createUsersParams) {
  return api.post<UsersResponse>('users/create', { ...params })
}

export interface editUserParams {
  _id: string
  name: string
  login: string
  password: string
  active?: boolean
}

export async function editUser(params: editUserParams) {
  return api.post<UsersResponse>('users/edit', params)
}

export interface removeUserParams {
  _ids: string[]
}

export async function removeUser(params: removeUserParams) {
  return api.post<UsersResponse>('users/remove', params)
}

export interface importUsersParams {
  file: File
}

export async function importUsers(params: importUsersParams) {
  return api.post<UsersResponse>('users/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export interface duplicateUserParams {
  _ids: string[]
}

export async function duplicateUser(params: duplicateUserParams) {
  return api.post<UsersResponse>('users/duplicate', params)
}
