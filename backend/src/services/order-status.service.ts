import type {
  CreateOrderStatusResponse,
  EditOrderStatusResponse,
  GetOrderStatusesResponse,
  RemoveOrderStatusesResponse,
} from '@remnant/shared'
import type {
  CreateOrderStatusPayload,
  EditOrderStatusPayload,
  GetOrderStatusesPayload,
  RemoveOrderStatusesPayload,
} from '@/types'
import { mapOrderStatusToDTO } from '@/mappers'
import * as OrderStatusRepo from '@/repositories/order-status.repo'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetOrderStatusesPayload }): Promise<GetOrderStatusesResponse> {
  const { items, total, page, pageSize } = await OrderStatusRepo.list(payload)

  return {
    status: 'success',
    code: 'ORDER_STATUSES_FETCHED',
    message: 'Order statuses fetched',
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

export async function create({ payload }: { payload: CreateOrderStatusPayload }): Promise<CreateOrderStatusResponse> {
  const orderStatus = await OrderStatusRepo.createOne(payload)

  return {
    status: 'success',
    code: 'ORDER_STATUS_CREATED',
    message: 'Order status created',
    data: mapOrderStatusToDTO(orderStatus),
  }
}

export async function edit({ payload }: { payload: EditOrderStatusPayload }): Promise<EditOrderStatusResponse> {
  const { id } = payload

  const orderStatus = await OrderStatusRepo.updateById(id, payload)

  if (!orderStatus) {
    throw new HttpError(400, 'Order status not edited', 'ORDER_STATUS_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'ORDER_STATUS_EDITED',
    message: 'Order status edited',
    data: mapOrderStatusToDTO(orderStatus),
  }
}

export async function remove({ payload }: { payload: RemoveOrderStatusesPayload }): Promise<RemoveOrderStatusesResponse> {
  for (const id of payload.ids) {
    await OrderStatusRepo.removeById(id)
  }

  return {
    status: 'success',
    code: 'ORDER_STATUSES_REMOVED',
    message: 'Order statuses removed',
  }
}
