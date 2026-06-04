import type { AggregateResult, UserDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateUsersRepoPayload,
  EditUsersRepoPayload,
  GetUsersRepoPayload,
  GetUsersRepoResult,
} from '@/types/'
import bcrypt from 'bcrypt'
import { UserModel } from '@/models'
import { buildQuery, buildSortQuery, HttpError, unwrapAggregate } from '@/utils'

export async function list(payload: GetUsersRepoPayload): Promise<GetUsersRepoResult> {
  const { current, pageSize } = payload.pagination

  const {
    name,
    login,
    role,
    active,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { name, login, role, active, createdAt, updatedAt },
    rules: {
      name: { type: 'string' },
      login: { type: 'string' },
      role: { type: 'string' },
      active: { type: 'array' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
  })

  const sorters = buildSortQuery(payload.sorters, { createdAt: 1 })

  const pipeline: PipelineStage[] = [
    { $match: query },
    {
      $lookup: {
        from: 'user-roles',
        localField: 'role',
        foreignField: '_id',
        as: 'role',
      },
    },
    { $unwind: '$role' },
    { $sort: sorters },
    {
      $facet: {
        items: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
          { $project: { password: 0 } },
        ],
        count: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await UserModel.aggregate<AggregateResult<UserDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function findById(id: string) {
  return UserModel.findOne({ _id: id, removed: false }).populate('role').exec()
}

export async function createOne(payload: CreateUsersRepoPayload) {
  const { name, login, password, role, active } = payload

  const hashedPassword = await bcrypt.hash(password, 10)

  const sameLogin = await UserModel.findOne({ login, removed: false })

  if (sameLogin) {
    throw new HttpError(409, 'User with this login already exists', 'USER_ALREADY_EXISTS')
  }

  const user = await UserModel.create({ name, login, password: hashedPassword, role, active })

  return user
}

export async function updateById(id: string, payload: EditUsersRepoPayload) {
  const { name, login, password, role, active } = payload

  let query: Record<string, any> = { name, login, role, active }

  if (typeof password === 'string') {
    const hashedPassword = await bcrypt.hash(password, 10)
    query = { ...query, password: hashedPassword }
  }

  const user = await UserModel.findOneAndUpdate({ _id: id }, { $set: query }, { new: true, runValidators: true }).exec()

  if (!user) {
    throw new HttpError(400, 'User not edited', 'USER_NOT_EDITED')
  }

  return user
}

export async function removeById(id: string) {
  return UserModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
