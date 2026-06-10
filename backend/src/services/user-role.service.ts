import type {
  CreateUserRoleResponse,
  EditUserRoleResponse,
  GetUserRolesResponse,
  RemoveUserRolesResponse,
} from '@remnant/shared'
import type { CreateUserRolesPayload, EditUserRolesPayload, GetUserRolesPayload, RemoveUserRolesPayload } from '@/types/'
import { mapUserRoleToDTO } from '@/mappers/'
import * as UserRoleRepository from '@/repositories/user-role.repo'
import { HttpError } from '@/utils'

export async function get(payload: GetUserRolesPayload): Promise<GetUserRolesResponse> {
  const { items, total, page, pageSize } = await UserRoleRepository.list(payload)

  return {
    status: 'success',
    code: 'USER_ROLES_FETCHED',
    message: 'User roles fetched',
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

export async function create(payload: CreateUserRolesPayload): Promise<CreateUserRoleResponse> {
  const userRole = await UserRoleRepository.createOne(payload)

  if (userRole === undefined)
    throw new HttpError(400, 'User role not created', 'USER_ROLE_NOT_CREATED')

  return {
    status: 'success',
    code: 'USER_ROLE_CREATED',
    message: 'User role created',
    data: mapUserRoleToDTO(userRole),
  }
}

export async function edit(payload: EditUserRolesPayload): Promise<EditUserRoleResponse> {
  const userRole = await UserRoleRepository.updateById(payload.id, payload)

  if (!userRole)
    throw new HttpError(400, 'User role not edited', 'USER_ROLE_NOT_EDITED')

  return {
    status: 'success',
    code: 'USER_ROLE_EDITED',
    message: 'User role edited',
    data: mapUserRoleToDTO(userRole),
  }
}

export async function remove(payload: RemoveUserRolesPayload): Promise<RemoveUserRolesResponse> {
  for (const id of payload.ids) {
    await UserRoleRepository.removeById(id)
  }

  return {
    status: 'success',
    code: 'USER_ROLES_REMOVED',
    message: 'User roles removed',
  }
}
