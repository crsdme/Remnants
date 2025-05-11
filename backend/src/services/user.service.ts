import type * as UserTypes from '../types/user.type'
import bcrypt from 'bcrypt'
import { UserModel } from '../models/user.model'
import { HttpError } from '../utils/httpError'
import { parseFile, toBoolean } from '../utils/parseTools'

export async function get(payload: UserTypes.getUsersParams): Promise<UserTypes.getUsersResult> {
  const { current = 1, pageSize = 10 } = payload.pagination

  const {
    name = '',
    login = '',
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

  const sorters = payload.sorters || {}

  let query: Record<string, any> = { removed: false }

  let sortersQuery: Record<string, any> = { _id: 1 }

  if (Object.entries(sorters).length > 0) {
    sortersQuery = Object.fromEntries(
      Object.entries(sorters).map(([key, value]) => [
        key,
        value === 'asc' ? 1 : -1,
      ]),
    )
  }

  if (name) {
    query = {
      ...query,
      name: { $regex: `^${name}`, $options: 'i' },
    }
  }

  if (login) {
    query = {
      ...query,
      login: { $regex: `^${login}`, $options: 'i' },
    }
  }

  if (Array.isArray(active) && active.length > 0) {
    query = {
      ...query,
      active: { $in: active },
    }
  }

  if (createdAt.from && createdAt.to) {
    query = {
      ...query,
      createdAt: { $gte: createdAt.from, $lte: createdAt.to },
    }
  }

  if (updatedAt.from && updatedAt.to) {
    query = {
      ...query,
      updatedAt: { $gte: updatedAt.from, $lte: updatedAt.to },
    }
  }

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sortersQuery,
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
  const { name, login, password, active } = payload

  const hashedPassword = await bcrypt.hash(password, 10)

  const sameLogin = await UserModel.findOne({ login, removed: false })

  if (sameLogin) {
    throw new HttpError(409, 'User with this login already exists', 'USER_ALREADY_EXISTS')
  }

  const user = await UserModel.create({ name, login, password: hashedPassword, active })

  if (!user) {
    throw new HttpError(400, 'User not created', 'USER_NOT_CREATED')
  }

  return { status: 'success', code: 'USER_CREATED', message: 'User created', user: user.removeSensitiveData({ exclude: ['password'] }) }
}

export async function edit(payload: UserTypes.editUserParams): Promise<UserTypes.editUserResult> {
  const { id, name, login, password, active } = payload

  let query: Record<string, any> = { name, login, active }

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

export async function upload(payload: UserTypes.importUsersParams): Promise<UserTypes.importUsersResult> {
  const { file } = payload

  const storedFile = await parseFile(file.path)

  const parsedUsers = storedFile.map(row => ({
    name: row.name,
    login: row.login,
    password: row.password,
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
    active: user.active,
  }))

  await UserModel.create(parsedUsers)

  return { status: 'success', code: 'USERS_DUPLICATED', message: 'Users duplicated' }
}
