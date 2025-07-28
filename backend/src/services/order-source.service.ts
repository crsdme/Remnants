import type * as OrderSourceTypes from '../types/order-source.type'
import { OrderSourceModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: OrderSourceTypes.getOrderSourcesParams): Promise<OrderSourceTypes.getOrderSourcesResult> {
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
      $facet: {
        orderSources: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const orderSourcesRaw = await OrderSourceModel.aggregate(pipeline).exec()

  const orderSources = orderSourcesRaw[0].orderSources.map((doc: any) => OrderSourceModel.hydrate(doc))
  const orderSourcesCount = orderSourcesRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'ORDER_SOURCES_FETCHED', message: 'Order sources fetched', orderSources, orderSourcesCount }
}

export async function create(payload: OrderSourceTypes.createOrderSourceParams): Promise<OrderSourceTypes.createOrderSourceResult> {
  const orderSource = await OrderSourceModel.create(payload)

  return { status: 'success', code: 'ORDER_SOURCE_CREATED', message: 'Order source created', orderSource }
}

export async function edit(payload: OrderSourceTypes.editOrderSourceParams): Promise<OrderSourceTypes.editOrderSourceResult> {
  const { id } = payload

  const orderSource = await OrderSourceModel.findOneAndUpdate({ _id: id }, payload)

  if (!orderSource) {
    throw new HttpError(400, 'Order source not edited', 'ORDER_SOURCE_NOT_EDITED')
  }

  return { status: 'success', code: 'ORDER_SOURCE_EDITED', message: 'Order source edited', orderSource }
}

export async function remove(payload: OrderSourceTypes.removeOrderSourcesParams): Promise<OrderSourceTypes.removeOrderSourcesResult> {
  const { ids } = payload

  const orderSources = await OrderSourceModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!orderSources) {
    throw new HttpError(400, 'Order sources not removed', 'ORDER_SOURCES_NOT_REMOVED')
  }

  return { status: 'success', code: 'ORDER_SOURCES_REMOVED', message: 'Order sources removed' }
}
