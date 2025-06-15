import { api } from '@/api/instance'

export interface getUserRolesParams {
  filters: {
    names?: string
    permissions?: string[]
    active?: boolean[]
    priority?: number
    createdAt?: {
      from?: Date
      to?: Date
    }
    updatedAt?: {
      from?: Date
      to?: Date
    }
    language?: string
  }
  sorters?: {
    names?: number
    permissions?: number
    active?: number
    priority?: number
    updatedAt?: number
    createdAt?: number
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export async function getUserRoles(params: getUserRolesParams) {
  return api.get<UsersResponse>('user-roles/get', { params })
}

export interface createUserRolesParams {
  names: LanguageString
  permissions: string[]
  priority: number
  active?: boolean
}

export async function createUserRole(params: createUserRolesParams) {
  return api.post<UsersResponse>('user-roles/create', { ...params })
}

export interface editUserRoleParams {
  id: string
  names: LanguageString
  permissions: string[]
  priority: number
  active?: boolean
}

export async function editUserRole(params: editUserRoleParams) {
  return api.post<UsersResponse>('user-roles/edit', params)
}

export interface removeUserRolesParams {
  ids: string[]
}

export async function removeUserRoles(params: removeUserRolesParams) {
  return api.post<UsersResponse>('user-roles/remove', params)
}

export interface importUserRolesParams {
  file: File
}

export async function importUserRoles(params: importUserRolesParams) {
  return api.post<UsersResponse>('user-roles/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export interface duplicateUserRolesParams {
  ids: string[]
}

export async function duplicateUserRoles(params: duplicateUserRolesParams) {
  return api.post<UsersResponse>('user-roles/duplicate', params)
}
