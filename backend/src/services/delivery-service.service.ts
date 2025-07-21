import type * as DeliveryServiceTypes from '../types/delivery-service.type'
import { DeliveryServiceModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: DeliveryServiceTypes.getDeliveryServicesParams): Promise<DeliveryServiceTypes.getDeliveryServicesResult> {
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
        deliveryServices: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const deliveryServicesRaw = await DeliveryServiceModel.aggregate(pipeline).exec()

  const deliveryServices = deliveryServicesRaw[0].deliveryServices.map((doc: any) => DeliveryServiceModel.hydrate(doc))
  const deliveryServicesCount = deliveryServicesRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'DELIVERY_SERVICES_FETCHED', message: 'Delivery services fetched', deliveryServices, deliveryServicesCount }
}

export async function create(payload: DeliveryServiceTypes.createDeliveryServiceParams): Promise<DeliveryServiceTypes.createDeliveryServiceResult> {
  const deliveryService = await DeliveryServiceModel.create(payload)

  return { status: 'success', code: 'DELIVERY_SERVICE_CREATED', message: 'Delivery service created', deliveryService }
}

export async function edit(payload: DeliveryServiceTypes.editDeliveryServiceParams): Promise<DeliveryServiceTypes.editDeliveryServiceResult> {
  const { id } = payload

  const deliveryService = await DeliveryServiceModel.findOneAndUpdate({ _id: id }, payload)

  if (!deliveryService) {
    throw new HttpError(400, 'Delivery service not edited', 'DELIVERY_SERVICE_NOT_EDITED')
  }

  return { status: 'success', code: 'DELIVERY_SERVICE_EDITED', message: 'Delivery service edited', deliveryService }
}

export async function remove(payload: DeliveryServiceTypes.removeDeliveryServicesParams): Promise<DeliveryServiceTypes.removeDeliveryServicesResult> {
  const { ids } = payload

  const deliveryServices = await DeliveryServiceModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!deliveryServices) {
    throw new HttpError(400, 'Delivery services not removed', 'DELIVERY_SERVICES_NOT_REMOVED')
  }

  return { status: 'success', code: 'DELIVERY_SERVICES_REMOVED', message: 'Delivery services removed' }
}
