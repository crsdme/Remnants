import type { AggregateResult, SiteDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateSiteRepoPayload,
  EditSiteRepoPayload,
  GetSitesRepoPayload,
  GetSitesRepoResult,
} from '@/types/'
import { SiteModel } from '@/models'
import { applyScopeIdsToQuery, buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(
  payload: GetSitesRepoPayload,
  options: { scopeIds?: string[] | null } = {},
): Promise<GetSitesRepoResult> {
  const {
    current,
    pageSize,
    full,
  } = payload.pagination

  const {
    names,
    url,
    key,
    priority,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { names, url, key, priority, createdAt, updatedAt },
    rules: {
      _id: { type: 'array' },
      names: { type: 'string', langAware: true },
      url: { type: 'string' },
      key: { type: 'string' },
      priority: { type: 'exact' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
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
        url: 1,
        key: 1,
        active: 1,
        priority: 1,
        warehouseIds: { $ifNull: ['$warehouseIds', []] },
        currencyId: 1,
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

  const raw = await SiteModel.aggregate<AggregateResult<SiteDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateSiteRepoPayload) {
  return SiteModel.create(payload)
}

export async function updateById(id: string, payload: EditSiteRepoPayload) {
  return SiteModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function findById(id: string) {
  return SiteModel.findById(id).exec()
}

export async function listActive() {
  return SiteModel.find({ active: true, removed: { $ne: true } }).exec()
}

export async function listActiveByIds(ids: string[]) {
  if (ids.length === 0)
    return []
  return SiteModel.find({ _id: { $in: ids }, active: true, removed: { $ne: true } }).exec()
}

export async function listActiveByWarehouseId(warehouseId: string) {
  return SiteModel.find({
    active: true,
    removed: { $ne: true },
    warehouseIds: warehouseId,
  }).exec()
}

export async function removeById(id: string) {
  return SiteModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
