import type {
  CreateOrderPaymentResponse,
  EditOrderPaymentResponse,
  GetOrderPaymentsResponse,
  RemoveOrderPaymentsResponse,
} from '@remnant/shared'
import type { ClientSession } from 'mongoose'
import type {
  CreateOrderPaymentsPayload,
  EditOrderPaymentsPayload,
  GetOrderPaymentsPayload,
  RemoveOrderPaymentsPayload,
} from '@/types'
import { mapOrderPaymentToDTO } from '@/mappers'
import * as OrderPaymentRepo from '@/repositories/order-payment.repo'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetOrderPaymentsPayload }): Promise<GetOrderPaymentsResponse> {
  const { items, total, page, pageSize } = await OrderPaymentRepo.list({ payload })

  return {
    status: 'success',
    code: 'ORDER_PAYMENTS_FETCHED',
    message: 'Order payments fetched',
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

export async function create({ payload }: { payload: CreateOrderPaymentsPayload, session?: ClientSession }): Promise<CreateOrderPaymentResponse> {
  const createdOrderPayment = await OrderPaymentRepo.createOne({ payload })

  if (createdOrderPayment.length === 0)
    throw new HttpError(400, 'Order payment not created', 'ORDER_PAYMENT_NOT_CREATED')

  const orderPayment = await OrderPaymentRepo.getById({ id: createdOrderPayment[0]._id })

  if (!orderPayment) {
    throw new HttpError(400, 'Order payment not found', 'ORDER_PAYMENT_NOT_CREATED')
  }

  return {
    status: 'success',
    code: 'ORDER_PAYMENT_CREATED',
    message: 'Order payment created',
    data: mapOrderPaymentToDTO(orderPayment),
  }
}

export async function edit({ payload }: { payload: EditOrderPaymentsPayload }): Promise<EditOrderPaymentResponse> {
  const { id } = payload

  const editedOrderPayment = await OrderPaymentRepo.updateById({ id, payload })

  if (!editedOrderPayment) {
    throw new HttpError(400, 'Order payment not edited', 'ORDER_PAYMENT_NOT_EDITED')
  }

  const orderPayment = await OrderPaymentRepo.getById({ id })

  if (!orderPayment) {
    throw new HttpError(400, 'Order payment not found', 'ORDER_PAYMENT_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'ORDER_PAYMENT_EDITED',
    message: 'Order payment edited',
    data: mapOrderPaymentToDTO(orderPayment),
  }
}

export async function remove({ payload }: { payload: RemoveOrderPaymentsPayload }): Promise<RemoveOrderPaymentsResponse> {
  const { ids } = payload

  for (const id of ids) {
    await OrderPaymentRepo.removeById({ id })
  }

  return { status: 'success', code: 'ORDER_PAYMENTS_REMOVED', message: 'Order payments removed' }
}
