import type {
  createUserRolesParams,
  duplicateUserRolesParams,
  editUserRoleParams,
  getUserRolesParams,
  importUserRolesParams,
  removeUserRolesParams,
  UserRolesResponse,
} from '@/api/types/users-roles'
import { api } from '@/api/instance'

export async function getUserRoles(params: getUserRolesParams) {
  return api.get<UserRolesResponse>('user-roles/get', { params })
}

export async function createUserRole(params: createUserRolesParams) {
  return api.post<UserRolesResponse>('user-roles/create', { ...params })
}

export async function editUserRole(params: editUserRoleParams) {
  return api.post<UserRolesResponse>('user-roles/edit', params)
}

export async function removeUserRoles(params: removeUserRolesParams) {
  return api.post<UserRolesResponse>('user-roles/remove', params)
}

export async function importUserRoles(params: importUserRolesParams) {
  return api.post<UserRolesResponse>('user-roles/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function duplicateUserRoles(params: duplicateUserRolesParams) {
  return api.post<UserRolesResponse>('user-roles/duplicate', params)
}
