import type { AggregateResult, UserAccessScopesDTO, UserPopulatedDTO } from '@remnant/shared'
import type { FilterQuery, PipelineStage } from 'mongoose'
import type {
  CreateUsersRepoPayload,
  EditUsersRepoPayload,
  GetUsersRepoPayload,
  GetUsersRepoResult,
  UserDB,
  UserPopulatedDB,
} from '@/types/'
import { emptyUserAccessScopes } from '@remnant/shared'
import bcrypt from 'bcrypt'
import { UserModel } from '@/models'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import { buildQuery, buildSortQuery, HttpError, unwrapAggregate } from '@/utils'

const emptyAccessProjection = {
  warehouses: emptyUserAccessScopes.warehouses,
  sites: emptyUserAccessScopes.sites,
  expenseCategories: emptyUserAccessScopes.expenseCategories,
  cashregisters: emptyUserAccessScopes.cashregisters,
  cashregisterAccounts: emptyUserAccessScopes.cashregisterAccounts,
  deliveryServices: emptyUserAccessScopes.deliveryServices,
  orderSources: emptyUserAccessScopes.orderSources,
  orderStatuses: emptyUserAccessScopes.orderStatuses,
}

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
    {
      $lookup: {
        from: 'user-accesses',
        localField: '_id',
        foreignField: 'userId',
        as: 'accessDocs',
      },
    },
    {
      $addFields: {
        access: {
          $let: {
            vars: { doc: { $arrayElemAt: ['$accessDocs', 0] } },
            in: {
              warehouses: { $ifNull: ['$$doc.warehouses', emptyAccessProjection.warehouses] },
              sites: { $ifNull: ['$$doc.sites', emptyAccessProjection.sites] },
              expenseCategories: { $ifNull: ['$$doc.expenseCategories', emptyAccessProjection.expenseCategories] },
              cashregisters: { $ifNull: ['$$doc.cashregisters', emptyAccessProjection.cashregisters] },
              cashregisterAccounts: { $ifNull: ['$$doc.cashregisterAccounts', emptyAccessProjection.cashregisterAccounts] },
              deliveryServices: { $ifNull: ['$$doc.deliveryServices', emptyAccessProjection.deliveryServices] },
              orderSources: { $ifNull: ['$$doc.orderSources', emptyAccessProjection.orderSources] },
              orderStatuses: { $ifNull: ['$$doc.orderStatuses', emptyAccessProjection.orderStatuses] },
            },
          },
        },
      },
    },
    { $sort: sorters },
    {
      $project: {
        _id: 0,
        id: '$_id',
        name: 1,
        login: 1,
        role: {
          id: '$role._id',
          names: '$role.names',
          permissions: '$role.permissions',
          priority: '$role.priority',
          active: '$role.active',
          createdAt: '$role.createdAt',
          updatedAt: '$role.updatedAt',
        },
        active: 1,
        access: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
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

  const raw = await UserModel.aggregate<AggregateResult<UserPopulatedDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function findById(id: string) {
  return UserModel.findOne({ _id: id, removed: false }).populate('role').exec() as Promise<UserPopulatedDB | null>
}

export async function findOne(query: FilterQuery<UserDB>) {
  return UserModel.findOne(query).populate('role').exec() as Promise<UserPopulatedDB & { password: string } | null>
}

export async function createOne(payload: CreateUsersRepoPayload) {
  const { name, login, password, role, active, access } = payload

  const hashedPassword = await bcrypt.hash(password, 10)

  const sameLogin = await UserModel.findOne({ login, removed: false })

  if (sameLogin) {
    throw new HttpError(409, 'User with this login already exists', 'USER_ALREADY_EXISTS')
  }

  const user = await UserModel.create({ name, login, password: hashedPassword, role, active })
  const userAccess = await UserAccessRepo.createForUser(user._id, access)

  return { user: user.toObject() as UserDB, access: userAccess }
}

export async function updateById(id: string, payload: EditUsersRepoPayload) {
  const { name, login, password, role, active, access } = payload

  let query: Record<string, any> = { name, login, role, active }

  if (typeof password === 'string') {
    const hashedPassword = await bcrypt.hash(password, 10)
    query = { ...query, password: hashedPassword }
  }

  const user = await UserModel.findOneAndUpdate({ _id: id }, { $set: query }, { new: true, runValidators: true }).lean().exec()

  if (!user) {
    throw new HttpError(400, 'User not edited', 'USER_NOT_EDITED')
  }

  const userAccess = await UserAccessRepo.upsertForUser(id, access)

  return { user: user as UserDB, access: userAccess }
}

export async function removeById(id: string) {
  return UserModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
