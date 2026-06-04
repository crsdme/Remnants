import type { AggregateResult, OrderSourceDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateOrderSourceRepoPayload,
  EditOrderSourceRepoPayload,
  GetOrderSourcesRepoPayload,
  GetOrderSourcesRepoResult,
} from '@/types/'
import { OrderSourceModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetOrderSourcesRepoPayload): Promise<GetOrderSourcesRepoResult> {
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

  const raw = await OrderSourceModel.aggregate<AggregateResult<OrderSourceDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateOrderSourceRepoPayload) {
  return OrderSourceModel.create(payload)
}

export async function updateById(id: string, payload: EditOrderSourceRepoPayload) {
  return OrderSourceModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function findById(id: string) {
  return OrderSourceModel.findById(id).exec()
}

export async function removeById(id: string) {
  return OrderSourceModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
