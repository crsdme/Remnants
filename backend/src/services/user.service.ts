import type * as UserTypes from '../types/user.type'
import bcrypt from 'bcrypt'
import { UserModel } from '../models/user.model'
import { parseCSV, toBoolean } from '../utils/parseTools'

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

  const usersResult = await UserModel.aggregate(pipeline).exec()

  const users = usersResult[0].users
  const usersCount = usersResult[0].totalCount[0]?.count || 0

  if (!users) {
    throw new Error('Users not found')
  }

  return { status: 'success', message: 'Users fetched', users, usersCount }
}

export async function create(payload: UserTypes.createUserParams): Promise<UserTypes.createUserResult> {
  const { name, login, password, active } = payload

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await UserModel.create({ name, login, password: hashedPassword, active })

  if (!user) {
    throw new Error('User not created')
  }

  return { status: 'success', message: 'User created', user }
}

export async function edit(payload: UserTypes.editUserParams): Promise<UserTypes.editUserResult> {
  const { _id, name, login, password, active } = payload

  let query: Record<string, any> = { name, login, active }

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10)
    query = { ...query, password: hashedPassword }
  }

  const user = await UserModel.findOneAndUpdate({ _id }, query)

  if (!user) {
    throw new Error('User not edited')
  }

  return { status: 'success', message: 'User edited', user }
}

export async function remove(payload: UserTypes.removeUsersParams): Promise<UserTypes.removeUsersResult> {
  const { _ids } = payload

  if (!_ids) {
    throw new Error('Need _IDS')
  }

  const users = await UserModel.updateMany(
    { _id: { $in: _ids } },
    { $set: { removed: true } },
  )

  if (!users) {
    throw new Error('Users not removed')
  }

  return { status: 'success', message: 'Users removed' }
}

export async function upload(payload: UserTypes.importUsersParams): Promise<UserTypes.importUsersResult> {
  const { file } = payload

  const storedFile = await parseCSV(file.path)

  const parsedUsers = storedFile.map(row => ({
    name: row.name,
    login: row.login,
    password: row.password,
    active: toBoolean(row.active),
  }))

  await UserModel.insertMany(parsedUsers)

  return { status: 'success', message: 'Users imported' }
}

export async function duplicate(payload: UserTypes.duplicateUsersParams): Promise<UserTypes.duplicateUsersResult> {
  const { _ids } = payload

  const users = await UserModel.find({ _id: { $in: _ids } })

  const usersCount = await UserModel.countDocuments()

  const parsedUsers = users.map(user => ({
    name: `${user.name} ${usersCount + 1}`,
    login: `${user.login} ${usersCount + 1}`,
    password: user.password,
    active: user.active,
  }))

  await UserModel.insertMany(parsedUsers)

  return { status: 'success', message: 'Users duplicated' }
}
