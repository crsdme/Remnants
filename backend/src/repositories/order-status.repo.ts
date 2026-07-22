import type { AggregateResult, OrderStatusDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateOrderStatusRepoPayload,
  EditOrderStatusRepoPayload,
  GetOrderStatusesRepoPayload,
  GetOrderStatusesRepoResult,
} from '@/types/'
import { OrderStatusModel } from '@/models'
import { applyScopeIdsToQuery, buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(
  payload: GetOrderStatusesRepoPayload,
  options: { scopeIds?: string[] | null } = {},
): Promise<GetOrderStatusesRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    names,
    language,
    color,
    priority,
    includeAll,
    includeCount,
    isLocked,
    isSelectable,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { names, color, priority, createdAt, updatedAt, isLocked, isSelectable },
    rules: {
      _id: { type: 'array' },
      names: { type: 'string', langAware: true },
      color: { type: 'string' },
      priority: { type: 'exact' },
      isLocked: { type: 'exact' },
      isSelectable: { type: 'exact' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
    language,
  })

  applyScopeIdsToQuery(query, options.scopeIds)

  const sorters = buildSortQuery(payload.sorters, { priority: 1 })

  const countStages: PipelineStage[] = []

  if (includeCount) {
    countStages.push(
      {
        $lookup: {
          from: 'orders',
          let: { statusId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$orderStatus', '$$statusId'] },
                    // { $ne: ['$removed', true] },
                  ],
                },
              },
            },
          ],
          as: 'relatedOrders',
        },
      },
      {
        $addFields: {
          ordersCount: { $size: '$relatedOrders' },
        },
      },
    )
  }

  const pipeline: PipelineStage[] = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    ...countStages,
    {
      $project: {
        _id: 0,
        id: '$_id',
        names: 1,
        color: 1,
        priority: 1,
        isLocked: 1,
        isSelectable: 1,
        createdAt: 1,
        updatedAt: 1,
        ...(includeCount ? { ordersCount: 1 } : {}),
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

  const raw = await OrderStatusModel.aggregate<AggregateResult<OrderStatusDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  if (includeAll) {
    const virtualAllStatus = {
      id: 'all',
      names: { en: 'All' },
      color: '#000000',
      isLocked: false,
      isSelectable: false,
      priority: -1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ordersCount: items.reduce<number>((acc, item) => acc + (item.ordersCount ?? 0), 0),
    }

    items.unshift(virtualAllStatus)
  }

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateOrderStatusRepoPayload) {
  return OrderStatusModel.create(payload)
}

export async function updateById(id: string, payload: EditOrderStatusRepoPayload) {
  return OrderStatusModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function findById(id: string) {
  return OrderStatusModel.findById(id).exec()
}

export async function removeById(id: string) {
  return OrderStatusModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
