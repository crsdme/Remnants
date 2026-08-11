import type {
  CountQuantitiesResponse,
  CreateQuantitiesResponse,
  EditQuantitiesResponse,
  GetQuantitiesResponse,
  RemoveQuantitiesResponse,
} from '@remnant/shared'
import type { ClientSession, UpdateQuery } from 'mongoose'
import type {
  CountQuantitiesPayload,
  CreateQuantityPayload,
  EditQuantityPayload,
  GetQuantitiesPayload,
  QuantityDB,
  RemoveQuantityPayload,
} from '@/types'
import { mapQuantityToDTO } from '@/mappers/'
import * as ProductRepository from '@/repositories/products.repo'
import * as QuantityRepository from '@/repositories/quantity.repo'
import * as ProductStockStatusService from '@/services/product-stock-status.service'
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
    warehouseId,
  } = payload

  const quantity = await QuantityRepository.createOne({
    payload: {
      count,
      productId,
      warehouseId,
    },
    session,
  })

  await ProductRepository.addQuantityToProducts({
    productIds: [productId],
    quantityId: quantity[0]._id,
    session,
  })

  await ProductStockStatusService.recomputeForProductWarehouse({
    productId,
    warehouseId,
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
    warehouseId,
    mode = 'inc',
    userId,
    refType,
    refId,
  } = payload

  const existing = await QuantityRepository.findByProductWarehouse({ productId, warehouseId, session })
  const previousCount = existing?.count ?? 0
  const afterCount = {
    set: count,
    inc: previousCount + count,
    dec: previousCount - count,
  }[mode]
  const deltaCount = afterCount - previousCount

  const updateVariants = {
    set: { $set: { count } },
    inc: { $inc: { count } },
    dec: { $inc: { count: count * -1 } },
  }[mode] as UpdateQuery<QuantityDB>

  if (refType === 'order') {
    updateVariants.$set = {
      ...(updateVariants.$set as Record<string, unknown> | undefined),
      lastSaleAt: new Date(),
    }
  }

  const quantity = await QuantityRepository.findAndUpdate({
    query: { productId, warehouseId },
    payload: updateVariants,
    session,
  })

  await WarehouseTransactionLogService.create({
    productId,
    warehouseId,
    deltaCount,
    previousCount,
    afterCount,
    refType,
    refId,
    userId,
  }, session)

  if (!quantity) {
    await create({ payload: { count: afterCount, productId, warehouseId }, session })

    if (refType === 'order') {
      await QuantityRepository.findAndUpdate({
        query: { productId, warehouseId },
        payload: { $set: { lastSaleAt: new Date() } },
        session,
      })
      await ProductStockStatusService.recomputeForProductWarehouse({
        productId,
        warehouseId,
        session,
      })
    }
  }
  else {
    await ProductStockStatusService.recomputeForProductWarehouse({
      productId,
      warehouseId,
      session,
    })
  }

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
      warehouseId: payload.warehouseId,
    },
    session,
  })

  if (!quantity)
    throw new HttpError(400, 'Quantity not edited', 'QUANTITY_NOT_EDITED')

  await ProductStockStatusService.recomputeForProductWarehouse({
    productId: payload.productId,
    warehouseId: payload.warehouseId,
    session,
  })

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
