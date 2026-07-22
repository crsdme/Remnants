import type { AggregateResult, DeliveryServiceDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateDeliveryServicesRepoPayload,
  EditDeliveryServicesRepoPayload,
  GetDeliveryServicesRepoPayload,
  GetDeliveryServicesRepoResult,
} from '@/types/'
import { DeliveryServiceModel } from '@/models'
import { applyScopeIdsToQuery, buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

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
    priority,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { names, color, priority, createdAt, updatedAt },
    rules: {
      _id: { type: 'array' },
      names: { type: 'string', langAware: true },
      color: { type: 'string' },
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
        seq: 1,
        names: 1,
        color: 1,
        type: 1,
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
        ],
        count: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await DeliveryServiceModel.aggregate<AggregateResult<DeliveryServiceDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateDeliveryServicesRepoPayload) {
  return DeliveryServiceModel.create(payload)
}

export async function updateById(id: string, payload: EditDeliveryServicesRepoPayload) {
  return DeliveryServiceModel.findOneAndUpdate(
    { _id: id },
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
