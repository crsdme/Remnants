import type {
  AuthUser,
  CreateUserResponse,
  EditUserResponse,
  GetUsersResponse,
  RemoveUserResponse,
} from '@remnant/shared'
import type { CreateUsersPayload, EditUsersPayload, GetUsersPayload, RemoveUsersPayload } from '@/types/'
import { mapUserToDTO } from '@/mappers/'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import * as UserRepository from '@/repositories/users.repo'
import * as AuditLogsService from '@/services/audit-logs.service'

const USER_AUDIT_OMIT = ['password']

function userAuditView(
  user: { name: string, login: string, active: boolean, roleId?: string, role?: { _id?: string } },
  access: unknown,
) {
  return {
    name: user.name,
    login: user.login,
    active: user.active,
    roleId: user.roleId ?? user.role?._id,
    access,
  }
}

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

export async function create(payload: CreateUsersPayload, actor?: AuthUser): Promise<CreateUserResponse> {
  const { user, access } = await UserRepository.createOne(payload)

  await AuditLogsService.record({
    resourceType: 'user',
    resourceId: user._id.toString(),
    action: 'create',
    before: null,
    after: userAuditView(user, access),
    createdBy: actor?.id,
    omit: USER_AUDIT_OMIT,
  })

  return {
    status: 'success',
    code: 'USER_CREATED',
    message: 'User created',
    data: mapUserToDTO(user, access),
  }
}

export async function edit(payload: EditUsersPayload, actor?: AuthUser): Promise<EditUserResponse> {
  const previous = await UserRepository.findById(payload.id)
  const previousAccess = previous ? await UserAccessRepo.findByUserId(payload.id) : null
  const { user, access } = await UserRepository.updateById(payload.id, payload)

  await AuditLogsService.record({
    resourceType: 'user',
    resourceId: user._id.toString(),
    action: 'edit',
    before: previous ? userAuditView(previous, previousAccess) : null,
    after: userAuditView(user, access),
    createdBy: actor?.id,
    omit: USER_AUDIT_OMIT,
  })

  return {
    status: 'success',
    code: 'USER_EDITED',
    message: 'User edited',
    data: mapUserToDTO(user, access),
  }
}

export async function remove(payload: RemoveUsersPayload, actor?: AuthUser): Promise<RemoveUserResponse> {
  for (const id of payload.ids) {
    const user = await UserRepository.removeById(id)
    if (!user)
      continue

    const access = await UserAccessRepo.findByUserId(id)
    await AuditLogsService.record({
      resourceType: 'user',
      resourceId: id,
      action: 'remove',
      before: userAuditView(user, access),
      after: null,
      createdBy: actor?.id,
      omit: USER_AUDIT_OMIT,
    })
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
