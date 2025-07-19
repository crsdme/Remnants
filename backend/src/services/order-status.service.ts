import type * as OrderStatusTypes from '../types/order-status.type'
import { OrderStatusModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: OrderStatusTypes.getOrderStatusesParams): Promise<OrderStatusTypes.getOrderStatusesResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    names = '',
    language = 'en',
    color = '',
    priority = undefined,
    createdAt = {
      from: undefined,
      to: undefined,
    },
    updatedAt = {
      from: undefined,
      to: undefined,
    },
  } = payload.filters || {}

  const filterRules = {
    _id: { type: 'array' },
    names: { type: 'string', langAware: true },
    color: { type: 'string' },
    priority: { type: 'exact' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { names, color, priority, createdAt, updatedAt },
    rules: filterRules,
    language,
  })

  const sorters = buildSortQuery(payload.sorters || {}, { priority: 1 })

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
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
                  { $ne: ['$removed', true] },
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
    {
      $project: {
        _id: 0,
        id: '$_id',
        names: 1,
        color: 1,
        priority: 1,
        createdAt: 1,
        updatedAt: 1,
        ordersCount: 1,
      },
    },
    {
      $facet: {
        orderStatuses: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const orderStatusesRaw = await OrderStatusModel.aggregate(pipeline).exec()

  const orderStatuses = orderStatusesRaw[0].orderStatuses
  const orderStatusesCount = orderStatusesRaw[0].totalCount[0]?.count || 0

  const virtualAllStatus = {
    id: null,
    names: { ru: 'Все', en: 'All' },
    color: null,
    priority: -1,
    createdAt: null,
    updatedAt: null,
    ordersCount: orderStatuses.reduce((acc: number, status: any) => acc + status.ordersCount, 0),
  }

  orderStatuses.unshift(virtualAllStatus)

  return { status: 'success', code: 'ORDER_STATUSES_FETCHED', message: 'Order statuses fetched', orderStatuses, orderStatusesCount }
}

export async function create(payload: OrderStatusTypes.createOrderStatusParams): Promise<OrderStatusTypes.createOrderStatusResult> {
  const orderStatus = await OrderStatusModel.create(payload)

  return { status: 'success', code: 'ORDER_STATUS_CREATED', message: 'Order status created', orderStatus }
}

export async function edit(payload: OrderStatusTypes.editOrderStatusParams): Promise<OrderStatusTypes.editOrderStatusResult> {
  const { id } = payload

  const orderStatus = await OrderStatusModel.findOneAndUpdate({ _id: id }, payload)

  if (!orderStatus) {
    throw new HttpError(400, 'Order status not edited', 'ORDER_STATUS_NOT_EDITED')
  }

  return { status: 'success', code: 'ORDER_STATUS_EDITED', message: 'Order status edited', orderStatus }
}

export async function remove(payload: OrderStatusTypes.removeOrderStatusesParams): Promise<OrderStatusTypes.removeOrderStatusesResult> {
  const { ids } = payload

  const orderStatuses = await OrderStatusModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!orderStatuses) {
    throw new HttpError(400, 'Order statuses not removed', 'ORDER_STATUSES_NOT_REMOVED')
  }

  return { status: 'success', code: 'ORDER_STATUSES_REMOVED', message: 'Order statuses removed' }
}
