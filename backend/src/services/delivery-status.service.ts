import type * as DeliveryStatusTypes from '../types/delivery-status.type'
import { DeliveryStatusModel } from '../models/'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: DeliveryStatusTypes.getDeliveryStatusesParams): Promise<DeliveryStatusTypes.getDeliveryStatusesResult> {
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
        deliveryStatuses: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const deliveryStatusesRaw = await DeliveryStatusModel.aggregate(pipeline).exec()

  const deliveryStatuses = deliveryStatusesRaw[0].deliveryStatuses
  const deliveryStatusesCount = deliveryStatusesRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'DELIVERY_STATUSES_FETCHED', message: 'Delivery statuses fetched', deliveryStatuses, deliveryStatusesCount }
}

export async function create(payload: DeliveryStatusTypes.createDeliveryStatusParams): Promise<DeliveryStatusTypes.createDeliveryStatusResult> {
  const deliveryStatus = await DeliveryStatusModel.create(payload)

  return { status: 'success', code: 'DELIVERY_STATUS_CREATED', message: 'Delivery status created', deliveryStatus }
}

export async function edit(payload: DeliveryStatusTypes.editDeliveryStatusParams): Promise<DeliveryStatusTypes.editDeliveryStatusResult> {
  const { id } = payload

  const deliveryStatus = await DeliveryStatusModel.findOneAndUpdate({ _id: id }, payload)

  if (!deliveryStatus) {
    throw new HttpError(400, 'Delivery status not edited', 'DELIVERY_STATUS_NOT_EDITED')
  }

  return { status: 'success', code: 'DELIVERY_STATUS_EDITED', message: 'Delivery status edited', deliveryStatus }
}

export async function remove(payload: DeliveryStatusTypes.removeDeliveryStatusesParams): Promise<DeliveryStatusTypes.removeDeliveryStatusesResult> {
  const { ids } = payload

  const deliveryStatuses = await DeliveryStatusModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!deliveryStatuses) {
    throw new HttpError(400, 'Delivery statuses not removed', 'DELIVERY_STATUSES_NOT_REMOVED')
  }

  return { status: 'success', code: 'DELIVERY_STATUSES_REMOVED', message: 'Delivery statuses removed' }
}
