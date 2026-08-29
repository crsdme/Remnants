import type { PipelineStage } from 'mongoose'
import type {
  CreateDeliveryServicesRepoPayload,
  DeliveryServiceDB,
  EditDeliveryServicesRepoPayload,
  GetDeliveryServicesRepoPayload,
  GetDeliveryServicesRepoResult,
} from '@/types/'
import { DeliveryServiceModel } from '@/models'
import { applyScopeIdsToQuery, buildQuery, buildSortQuery } from '@/utils'

export async function list(
  payload: GetDeliveryServicesRepoPayload,
  options: { scopeIds?: string[] | null } = {},
): Promise<GetDeliveryServicesRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    names,
    language,
    color,
    type,
    priority,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { names, color, type, priority, createdAt, updatedAt },
    rules: {
      _id: { type: 'array' },
      names: { type: 'string', langAware: true },
      color: { type: 'string' },
      type: { type: 'exact' },
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
      $facet: {
        items: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        count: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await DeliveryServiceModel.aggregate<{
    items: DeliveryServiceDB[]
    count: Array<{ count: number }>
  }>(pipeline).exec()

  const facet = raw[0]
  const items = facet?.items ?? []
  const total = facet?.count[0]?.count ?? 0

  return { items, total, page: current, pageSize }
}

export async function findById(id: string) {
  return DeliveryServiceModel.findOne({ _id: id, removed: false }).lean().exec()
}

export async function createOne(payload: CreateDeliveryServicesRepoPayload) {
  return DeliveryServiceModel.create(payload)
}

export async function updateById(
  id: string,
  payload: EditDeliveryServicesRepoPayload & {
    credentials?: CreateDeliveryServicesRepoPayload['credentials']
  },
) {
  return DeliveryServiceModel.findOneAndUpdate(
    { _id: id, removed: false },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function removeById(id: string) {
  return DeliveryServiceModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
