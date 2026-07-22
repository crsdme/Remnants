import type { AggregateResult, WarehouseDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateWarehouseRepoPayload,
  EditWarehouseRepoPayload,
  GetWarehousesRepoPayload,
  GetWarehousesRepoResult,
} from '@/types/'
import { WarehouseModel } from '@/models'
import { applyScopeIdsToQuery, buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetWarehousesRepoPayload, options: { scopeIds?: string[] | null } = {}): Promise<GetWarehousesRepoResult> {
  const {
    current,
    pageSize,
    full,
  } = payload.pagination

  const {
    ids,
    names,
    priority,
    createdAt,
    updatedAt,
    language,
  } = payload.filters

  const query = buildQuery({
    filters: { _id: ids, names, priority, createdAt, updatedAt },
    rules: {
      _id: { type: 'array' },
      names: { type: 'string', langAware: true },
      priority: { type: 'exact' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
    language,
  })

  applyScopeIdsToQuery(query, options.scopeIds)

  const sorters = buildSortQuery(payload.sorters, { priority: 1 })

  const pipeline: PipelineStage[] = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        names: 1,
        active: 1,
        priority: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $facet: {
        items: full
          ? []
          : [{ $skip: (current - 1) * pageSize }, { $limit: pageSize }],
        count: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await WarehouseModel.aggregate<AggregateResult<WarehouseDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateWarehouseRepoPayload) {
  return WarehouseModel.create(payload)
}

export async function updateById(id: string, payload: EditWarehouseRepoPayload) {
  return WarehouseModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function findById(id: string) {
  return WarehouseModel.findById(id).exec()
}

export async function removeById(id: string) {
  return WarehouseModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
