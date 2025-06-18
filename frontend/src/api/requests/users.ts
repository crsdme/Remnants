import type {
  createUsersParams,
  duplicateUserParams,
  editUserParams,
  getUsersParams,
  importUsersParams,
  removeUserParams,
  UsersResponse,
} from '@/api/types/users'
import { api } from '@/api/instance'

export async function getUsers(params: getUsersParams) {
  return api.get<UsersResponse>('users/get', { params })
}

export async function createUser(params: createUsersParams) {
  return api.post<UsersResponse>('users/create', { ...params })
}

export async function editUser(params: editUserParams) {
  return api.post<UsersResponse>('users/edit', params)
}

export async function removeUser(params: removeUserParams) {
  return api.post<UsersResponse>('users/remove', params)
}

export async function importUsers(params: importUsersParams) {
  return api.post<UsersResponse>('users/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function duplicateUser(params: duplicateUserParams) {
  return api.post<UsersResponse>('users/duplicate', params)
}
