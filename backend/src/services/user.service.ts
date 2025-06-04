import type * as UserTypes from '../types/user.type'
import bcrypt from 'bcrypt'
import { UserModel } from '../models/user.model'
import { HttpError } from '../utils/httpError'
import { parseFile, toBoolean } from '../utils/parseTools'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: UserTypes.getUsersParams): Promise<UserTypes.getUsersResult> {
  const { current = 1, pageSize = 10 } = payload.pagination

  const {
    name = '',
    login = '',
    role = '',
    active = undefined,
    createdAt = {
      from: undefined,
      to: undefined,
    },
    updatedAt = {
      from: undefined,
      to: undefined,
    },
  } = payload.filters

  const sorters = buildSortQuery(payload.sorters)

  const filterRules = {
    name: { type: 'string' },
    login: { type: 'string' },
    role: { type: 'string' },
    active: { type: 'array' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { name, login, role, active, createdAt, updatedAt },
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
      $lookup: {
        from: 'user-roles',
        localField: 'role',
        foreignField: '_id',
        as: 'role',
      },
    },
    {
      $unwind: '$role',
    },
    {
      $facet: {
        users: [
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

  const usersRaw = await UserModel.aggregate(pipeline).exec()

  const users = usersRaw[0].users.map((doc: any) => UserModel.hydrate(doc))
  const usersCount = usersRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'USERS_FETCHED', message: 'Users fetched', users, usersCount }
}

export async function create(payload: UserTypes.createUserParams): Promise<UserTypes.createUserResult> {
  const { name, login, password, role, active } = payload

  const hashedPassword = await bcrypt.hash(password, 10)

  const sameLogin = await UserModel.findOne({ login, removed: false })

  if (sameLogin) {
    throw new HttpError(409, 'User with this login already exists', 'USER_ALREADY_EXISTS')
  }

  const user = await UserModel.create({ name, login, password: hashedPassword, role, active })

  if (!user) {
    throw new HttpError(400, 'User not created', 'USER_NOT_CREATED')
  }

  return { status: 'success', code: 'USER_CREATED', message: 'User created', user: user.removeSensitiveData({ exclude: ['password'] }) }
}

export async function edit(payload: UserTypes.editUserParams): Promise<UserTypes.editUserResult> {
  const { id, name, login, password, role, active } = payload

  let query: Record<string, any> = { name, login, role, active }

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10)
    query = { ...query, password: hashedPassword }
  }

  const user = await UserModel.findOneAndUpdate({ _id: id }, query)

  if (!user) {
    throw new HttpError(400, 'User not edited', 'USER_NOT_EDITED')
  }

  return { status: 'success', code: 'USER_EDITED', message: 'User edited', user: user.removeSensitiveData({ exclude: ['password'] }) }
}

export async function remove(payload: UserTypes.removeUsersParams): Promise<UserTypes.removeUsersResult> {
  const { ids } = payload

  const users = await UserModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!users) {
    throw new HttpError(400, 'Users not removed', 'USERS_NOT_REMOVED')
  }

  return { status: 'success', code: 'USERS_REMOVED', message: 'Users removed' }
}

export async function importHandler(payload: UserTypes.importUsersParams): Promise<UserTypes.importUsersResult> {
  const { file } = payload

  const storedFile = await parseFile(file.path)

  const parsedUsers = storedFile.map(row => ({
    name: row.name,
    login: row.login,
    password: row.password,
    role: row.role,
    active: toBoolean(row.active),
  }))

  const logins = parsedUsers.map(user => user.login)
  const existingUsers = await UserModel.find({
    login: { $in: logins },
    removed: false,
  }).select('login')

  if (existingUsers.length > 0) {
    const existingLogins = existingUsers.map(u => u.login)
    throw new HttpError(409, 'Users with these logins already exist', 'USER_ALREADY_EXISTS', existingLogins.join(', '))
  }

  await UserModel.create(parsedUsers)

  return { status: 'success', code: 'USERS_IMPORTED', message: 'Users imported' }
}

export async function duplicate(payload: UserTypes.duplicateUsersParams): Promise<UserTypes.duplicateUsersResult> {
  const { ids } = payload

  const users = await UserModel.find({ _id: { $in: ids } })

  const usersCount = await UserModel.countDocuments()

  const parsedUsers = users.map(user => ({
    name: `${user.name} ${usersCount + 1}`,
    login: `${user.login} ${usersCount + 1}`,
    password: user.password,
    role: user.role,
    active: user.active,
  }))

  await UserModel.create(parsedUsers)

  return { status: 'success', code: 'USERS_DUPLICATED', message: 'Users duplicated' }
}
