import type { AggregateResult, UserRoleDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateUserRolesRepoPayload,
  EditUserRolesRepoPayload,
  GetUserRolesRepoPayload,
  GetUserRolesRepoResult,
} from '@/types/'
import { UserRoleModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetUserRolesRepoPayload): Promise<GetUserRolesRepoResult> {
  const { current, pageSize } = payload.pagination

  const {
    names = '',
    permissions = [],
    priority = undefined,
    active = undefined,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { names, permissions, priority, active, createdAt, updatedAt },
    rules: {
      names: { type: 'string', langAware: true },
      permissions: { type: 'array' },
      priority: { type: 'exact' },
      active: { type: 'array' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
  })

  const sorters = buildSortQuery(payload.sorters, { priority: 1 })

  const pipeline: PipelineStage[] = [
    { $match: query },
    { $sort: sorters },
    {
      $project: {
        _id: 0,
        id: '$_id',
        names: 1,
        permissions: 1,
        priority: 1,
        active: 1,
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

  const raw = await UserRoleModel.aggregate<AggregateResult<UserRoleDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateUserRolesRepoPayload) {
  return UserRoleModel.create(payload)
}

export async function updateById(id: string, payload: EditUserRolesRepoPayload) {
  return UserRoleModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function findById(id: string) {
  return UserRoleModel.findById(id).exec()
}

export async function removeById(id: string) {
  return UserRoleModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
