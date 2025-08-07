import type * as QuantityTypes from '../types/quantity.type'
import { ProductModel, QuantityModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: QuantityTypes.getQuantitiesParams): Promise<QuantityTypes.getQuantitiesResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    product = '',
    warehouse = '',
    status = '',
    count = 0,
  } = payload.filters || {}

  const sorters = buildSortQuery(payload.sorters || {}, { count: 1 })

  const filterRules = {
    product: { type: 'exact' },
    warehouse: { type: 'exact' },
    status: { type: 'exact' },
    count: { type: 'exact' },
  } as const

  const query = buildQuery({
    filters: { product, warehouse, status, count },
    rules: filterRules,
  })

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $facet: {
        quantities: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const quantitiesRaw = await QuantityModel.aggregate(pipeline).exec()

  const quantities = quantitiesRaw[0].quantities
  const quantitiesCount = quantitiesRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'QUANTITIES_FETCHED', message: 'Quantities fetched', quantities, quantitiesCount }
}

export async function create(payload: QuantityTypes.createQuantitiesParams): Promise<QuantityTypes.createQuantitiesResult> {
  const {
    count,
    product,
    warehouse,
  } = payload

  const quantity = await QuantityModel.create({
    count,
    product,
    warehouse,
  })

  await ProductModel.updateOne({ _id: product }, { $push: { quantity: quantity._id } })

  return { status: 'success', code: 'QUANTITY_CREATED', message: 'Quantity created', quantity }
}

export async function count(payload: QuantityTypes.countQuantitiesParams): Promise<QuantityTypes.countQuantitiesResult> {
  const {
    count,
    product,
    warehouse,
    mode = 'inc',
  } = payload

  const update = {
    set: { $set: { count } },
    inc: { $inc: { count } },
  }

  const quantity = await QuantityModel.findOneAndUpdate({ product, warehouse }, update[mode], { new: true })

  if (!quantity) {
    await create({ count, product, warehouse })
  }

  return { status: 'success', code: 'QUANTITY_COUNTED', message: 'Quantity counted' }
}

export async function edit(payload: QuantityTypes.editQuantitiesParams): Promise<QuantityTypes.editQuantitiesResult> {
  const {
    id,
    count,
    product,
    warehouse,
  } = payload

  const quantity = await QuantityModel.findOneAndUpdate({ _id: id }, {
    count,
    product,
    warehouse,
  })

  if (!quantity) {
    throw new HttpError(400, 'Quantity not edited', 'QUANTITY_NOT_EDITED')
  }

  return { status: 'success', code: 'QUANTITY_EDITED', message: 'Quantity edited', quantity }
}

export async function remove(payload: QuantityTypes.removeQuantitiesParams): Promise<QuantityTypes.removeQuantitiesResult> {
  const { ids } = payload

  const quantities = await QuantityModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!quantities) {
    throw new HttpError(400, 'Quantities not removed', 'QUANTITIES_NOT_REMOVED')
  }

  return { status: 'success', code: 'QUANTITIES_REMOVED', message: 'Quantities removed' }
}
