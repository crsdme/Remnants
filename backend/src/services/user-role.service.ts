import type {
  AuthUser,
  CreateUserRoleResponse,
  EditUserRoleResponse,
  GetUserRolesResponse,
  RemoveUserRolesResponse,
} from '@remnant/shared'
import type { CreateUserRolesPayload, EditUserRolesPayload, GetUserRolesPayload, RemoveUserRolesPayload } from '@/types/'
import { mapUserRoleToDTO } from '@/mappers/'
import * as UserRoleRepository from '@/repositories/user-role.repo'
import * as AuditLogsService from '@/services/audit-logs.service'
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

export async function create(payload: CreateUserRolesPayload, actor?: AuthUser): Promise<CreateUserRoleResponse> {
  const userRole = await UserRoleRepository.createOne(payload)

  if (userRole === undefined)
    throw new HttpError(400, 'User role not created', 'USER_ROLE_NOT_CREATED')

  await AuditLogsService.record({
    resourceType: 'user-role',
    resourceId: userRole._id.toString(),
    action: 'create',
    before: null,
    after: userRole,
    createdBy: actor?.id,
  })

  return {
    status: 'success',
    code: 'USER_ROLE_CREATED',
    message: 'User role created',
    data: mapUserRoleToDTO(userRole),
  }
}

export async function edit(payload: EditUserRolesPayload, actor?: AuthUser): Promise<EditUserRoleResponse> {
  const before = await UserRoleRepository.findById(payload.id)
  const userRole = await UserRoleRepository.updateById(payload.id, payload)

  if (!userRole)
    throw new HttpError(400, 'User role not edited', 'USER_ROLE_NOT_EDITED')

  await AuditLogsService.record({
    resourceType: 'user-role',
    resourceId: userRole._id.toString(),
    action: 'edit',
    before,
    after: userRole,
    createdBy: actor?.id,
  })

  return {
    status: 'success',
    code: 'USER_ROLE_EDITED',
    message: 'User role edited',
    data: mapUserRoleToDTO(userRole),
  }
}

export async function remove(payload: RemoveUserRolesPayload, actor?: AuthUser): Promise<RemoveUserRolesResponse> {
  for (const id of payload.ids) {
    const userRole = await UserRoleRepository.removeById(id)
    if (!userRole)
      continue

    await AuditLogsService.record({
      resourceType: 'user-role',
      resourceId: id,
      action: 'remove',
      before: userRole,
      after: null,
      createdBy: actor?.id,
    })
  }

  return {
    status: 'success',
    code: 'USER_ROLES_REMOVED',
    message: 'User roles removed',
  }
}
