import type {
  CreateUserRoleParams,
  CreateUserRoleResponse,
  EditUserRoleParams,
  EditUserRoleResponse,
  GetUserRolesParams,
  GetUserRolesResponse,
  RemoveUserRolesParams,
  RemoveUserRolesResponse,
} from '@remnant/shared'
import { UserRoleModel } from '@/models/'
import { buildQuery, buildSortQuery, HttpError } from '@/utils'

export async function get(payload: GetUserRolesParams): Promise<GetUserRolesResponse> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    names = '',
    permissions = [],
    priority = undefined,
    active = undefined,
    createdAt = {
      from: undefined,
      to: undefined,
    },
    updatedAt = {
      from: undefined,
      to: undefined,
    },
  } = payload.filters || {}

  const sorters = buildSortQuery(payload.sorters || {}, { priority: 1 })

  const filterRules = {
    names: { type: 'string', langAware: true },
    permissions: { type: 'array' },
    priority: { type: 'exact' },
    active: { type: 'array' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { names, permissions, priority, active, createdAt, updatedAt },
    rules: filterRules,
  })

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $facet: {
        userRoles: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
          { $project: { password: 0 } },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const userRolesRaw = await UserRoleModel.aggregate(pipeline).exec()

  const userRoles = userRolesRaw[0].userRoles.map((doc: any) => UserRoleModel.hydrate(doc))
  const userRolesCount = userRolesRaw[0].totalCount[0]?.count || 0

  return {
    status: 'success',
    code: 'USER_ROLES_FETCHED',
    message: 'User roles fetched',
    data: {
      items: userRoles,
      pagination: {
        total: userRolesCount,
        page: current,
        pageSize,
      },
    },
  }
}

export async function create(payload: CreateUserRoleParams): Promise<CreateUserRoleResponse> {
  const { names, permissions, priority, active } = payload

  const userRole = await UserRoleModel.create({ names, permissions, priority, active })

  if (!userRole) {
    throw new HttpError(400, 'User role not created', 'USER_ROLE_NOT_CREATED')
  }

  return {
    status: 'success',
    code: 'USER_ROLE_CREATED',
    message: 'User role created',
    data: userRole,
  }
}

export async function edit(payload: EditUserRoleParams): Promise<EditUserRoleResponse> {
  const { id, names, permissions, priority, active } = payload

  const query = { names, permissions, priority, active }

  const userRole = await UserRoleModel.findOneAndUpdate({ _id: id }, query)

  if (!userRole) {
    throw new HttpError(400, 'User role not edited', 'USER_ROLE_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'USER_ROLE_EDITED',
    message: 'User role edited',
    data: userRole,
  }
}

export async function remove(payload: RemoveUserRolesParams): Promise<RemoveUserRolesResponse> {
  const { ids } = payload

  const userRoles = await UserRoleModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!userRoles) {
    throw new HttpError(400, 'User roles not removed', 'USER_ROLES_NOT_REMOVED')
  }

  return {
    status: 'success',
    code: 'USER_ROLES_REMOVED',
    message: 'User roles removed',
  }
}

// export async function importHandler(payload: importUserRolesParams): Promise<importUserRolesResult> {
//   const { file } = payload

//   const storedFile = await parseFile(file.path)

//   const parsedUserRoles = storedFile.map(row => ({
//     name: row.name,
//     permissions: row.permissions,
//     priority: row.priority,
//     active: toBoolean(row.active),
//   }))

//   await UserRoleModel.create(parsedUserRoles)

//   return { status: 'success', code: 'USER_ROLES_IMPORTED', message: 'User roles imported' }
// }

// export async function duplicate(payload: duplicateUserRolesParams): Promise<duplicateUserRolesResult> {
//   const { ids } = payload

//   const userRoles = await UserRoleModel.find({ _id: { $in: ids } })

//   const parsedUserRoles = userRoles.map(userRole => ({
//     names: userRole.names,
//     permissions: userRole.permissions,
//     priority: userRole.priority,
//     active: userRole.active,
//   }))

//   await UserRoleModel.create(parsedUserRoles)

//   return { status: 'success', code: 'USER_ROLES_DUPLICATED', message: 'User roles duplicated' }
// }
