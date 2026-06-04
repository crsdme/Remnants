import type {
  CountQuantitiesParams,
  CountQuantitiesResponse,
  CreateQuantitiesParams,
  CreateQuantitiesResponse,
  EditQuantitiesParams,
  EditQuantitiesResponse,
  GetQuantitiesParams,
  GetQuantitiesResponse,
  RemoveQuantitiesParams,
  RemoveQuantitiesResponse,
} from '@remnant/shared'
import type { ClientSession } from 'mongoose'
import { ProductModel, QuantityModel } from '@/models/'
import * as WarehouseTransactionLogService from '@/services/warehouse-transaction-log.service'
import { HttpError } from '@/utils/'
import { buildQuery, buildSortQuery } from '@/utils/queryBuilder'

export async function get(payload: GetQuantitiesParams): Promise<GetQuantitiesResponse> {
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

  return {
    status: 'success',
    code: 'QUANTITIES_FETCHED',
    message: 'Quantities fetched',
    data: {
      items: quantities,
      pagination: {
        page: current,
        pageSize,
        total: quantitiesCount,
      },
    },
  }
}

export async function create(payload: CreateQuantitiesParams, session?: ClientSession): Promise<CreateQuantitiesResponse> {
  const {
    count,
    product,
    warehouse,
  } = payload

  const quantity = await QuantityModel.create([{
    count,
    product,
    warehouse,
  }], { session })

  await ProductModel.updateOne({ _id: product }, { $push: { quantity: quantity[0]._id } }, { session })

  return {
    status: 'success',
    code: 'QUANTITY_CREATED',
    message: 'Quantity created',
    data: quantity[0],
  }
}

export async function count(payload: CountQuantitiesParams, session?: ClientSession): Promise<CountQuantitiesResponse> {
  const {
    count,
    product,
    warehouse,
    mode = 'inc',
    userId,
    refType,
    refId,
  } = payload

  const update = {
    set: { $set: { count } },
    inc: { $inc: { count } },
  }

  const quantity = await QuantityModel.findOneAndUpdate({ product, warehouse }, update[mode], { new: true, session })

  await WarehouseTransactionLogService.create({
    productId: product,
    warehouseId: warehouse,
    deltaCount: count,
    refType,
    refId,
    userId,
  }, session)

  if (!quantity) {
    await create({ count, product, warehouse }, session)
  }

  return {
    status: 'success',
    code: 'QUANTITY_COUNTED',
    message: 'Quantity counted',
  }
}

export async function edit(payload: EditQuantitiesParams): Promise<EditQuantitiesResponse> {
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

  return {
    status: 'success',
    code: 'QUANTITY_EDITED',
    message: 'Quantity edited',
    data: quantity,
  }
}

export async function remove(payload: RemoveQuantitiesParams): Promise<RemoveQuantitiesResponse> {
  const { ids } = payload

  const quantities = await QuantityModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!quantities) {
    throw new HttpError(400, 'Quantities not removed', 'QUANTITIES_NOT_REMOVED')
  }

  return {
    status: 'success',
    code: 'QUANTITIES_REMOVED',
    message: 'Quantities removed',
  }
}
