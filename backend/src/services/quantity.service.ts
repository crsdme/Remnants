import type {
  CountQuantitiesResponse,
  CreateQuantitiesResponse,
  EditQuantitiesResponse,
  GetQuantitiesResponse,
  RemoveQuantitiesResponse,
} from '@remnant/shared'
import type { ClientSession } from 'mongoose'
import type {
  CountQuantitiesPayload,
  CreateQuantityPayload,
  EditQuantityPayload,
  GetQuantitiesPayload,
  RemoveQuantityPayload,
} from '@/types'
import { mapQuantityToDTO } from '@/mappers/'
import * as ProductRepository from '@/repositories/products.repo'
import * as QuantityRepository from '@/repositories/quantity.repo'
import * as WarehouseTransactionLogService from '@/services/warehouse-transaction-log.service'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetQuantitiesPayload }): Promise<GetQuantitiesResponse> {
  const { items, total, page, pageSize } = await QuantityRepository.list(payload)

  return {
    status: 'success',
    code: 'QUANTITIES_FETCHED',
    message: 'Quantities fetched',
    data: {
      items,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function create({ payload, session }: { payload: CreateQuantityPayload, session?: ClientSession }): Promise<CreateQuantitiesResponse> {
  const {
    count,
    productId,
    warehouse,
  } = payload

  const quantity = await QuantityRepository.createOne({
    payload: {
      count,
      productId,
      warehouse,
    },
    session,
  })

  await ProductRepository.addQuantityToProducts({
    productIds: [productId],
    quantityId: quantity[0]._id,
    session,
  })

  return {
    status: 'success',
    code: 'QUANTITY_CREATED',
    message: 'Quantity created',
    data: mapQuantityToDTO(quantity[0]),
  }
}

export async function count({ payload, session }: { payload: CountQuantitiesPayload, session?: ClientSession }): Promise<CountQuantitiesResponse> {
  const {
    count,
    productId,
    warehouse,
    mode = 'inc',
    userId,
    refType,
    refId,
  } = payload

  const updateVariants = {
    set: { $set: { count } },
    inc: { $inc: { count } },
    dec: { $inc: { count: count * -1 } },
  }[mode]

  const createVariants = {
    set: count,
    inc: count,
    dec: count * -1,
  }[mode]

  const quantity = await QuantityRepository.findAndUpdate({
    query: { productId, warehouse },
    payload: updateVariants,
    session,
  })

  await WarehouseTransactionLogService.create({
    productId,
    warehouseId: warehouse,
    deltaCount: createVariants,
    refType,
    refId,
    userId,
  }, session)

  if (!quantity)
    await create({ payload: { count: createVariants, productId, warehouse }, session })

  return {
    status: 'success',
    code: 'QUANTITY_COUNTED',
    message: 'Quantity counted',
  }
}

export async function edit({ payload, session }: { payload: EditQuantityPayload, session?: ClientSession }): Promise<EditQuantitiesResponse> {
  const quantity = await QuantityRepository.updateById({
    id: payload.id,
    payload: {
      id: payload.id,
      count: payload.count,
      productId: payload.productId,
      warehouse: payload.warehouse,
    },
    session,
  })

  if (!quantity)
    throw new HttpError(400, 'Quantity not edited', 'QUANTITY_NOT_EDITED')

  return {
    status: 'success',
    code: 'QUANTITY_EDITED',
    message: 'Quantity edited',
    data: mapQuantityToDTO(quantity),
  }
}

export async function remove({ payload }: { payload: RemoveQuantityPayload }): Promise<RemoveQuantitiesResponse> {
  for (const id of payload.ids) {
    const quantity = await QuantityRepository.removeById(id)

    if (!quantity)
      throw new HttpError(400, 'Quantity not removed', 'QUANTITY_NOT_REMOVED')
  }

  return {
    status: 'success',
    code: 'QUANTITIES_REMOVED',
    message: 'Quantities removed',
  }
}
