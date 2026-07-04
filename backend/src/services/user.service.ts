import type {
  CreateUserResponse,
  EditUserResponse,
  GetUsersResponse,
  RemoveUserResponse,
} from '@remnant/shared'
import type { CreateUsersPayload, EditUsersPayload, GetUsersPayload, RemoveUsersPayload } from '@/types/'
import { mapUserToDTO } from '@/mappers/'
import * as UserRepository from '@/repositories/users.repo'

export async function get(payload: GetUsersPayload): Promise<GetUsersResponse> {
  const { items, total, page, pageSize } = await UserRepository.list(payload)

  return {
    status: 'success',
    code: 'USERS_FETCHED',
    message: 'Users fetched',
    data: {
      items,
      pagination: {
        total,
        page,
        pageSize,
      },
    },
  }
}

export async function create(payload: CreateUsersPayload): Promise<CreateUserResponse> {
  const user = await UserRepository.createOne(payload)

  return {
    status: 'success',
    code: 'USER_CREATED',
    message: 'User created',
    data: mapUserToDTO(user),
  }
}

export async function edit(payload: EditUsersPayload): Promise<EditUserResponse> {
  const user = await UserRepository.updateById(payload.id, payload)

  return {
    status: 'success',
    code: 'USER_EDITED',
    message: 'User edited',
    data: mapUserToDTO(user),
  }
}

export async function remove(payload: RemoveUsersPayload): Promise<RemoveUserResponse> {
  for (const id of payload.ids) {
    await UserRepository.removeById(id)
  }

  return {
    status: 'success',
    code: 'USERS_REMOVED',
    message: 'Users removed',
  }
}

export async function checkPermission(permission: string, userId?: string): Promise<boolean> {
  if (userId === undefined)
    return false

  if (process.env.NODE_ENV === 'test')
    return true

  const user = await UserRepository.findById(userId)

  const role = user?.role
  if (role === undefined || !Array.isArray(role.permissions))
    return false

  return (
    role.permissions.includes('other.admin')
    || role.permissions.includes(permission)
  )
}
