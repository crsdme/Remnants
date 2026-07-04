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
import {
  mapCreateOrderPaymentPayloadToRepoPayload,
  mapEditOrderPaymentPayloadToRepoPayload,
  mapOrderPaymentPopulatedItem,
  mapOrderPaymentToDTO,
} from '@/mappers'
import * as CurrencyRepo from '@/repositories/currencies.repo'
import * as OrderPaymentRepo from '@/repositories/order-payment.repo'
import { HttpError } from '@/utils/'
import { toMinor } from '@/utils/money'

export async function get({ payload }: { payload: GetOrderPaymentsPayload }): Promise<GetOrderPaymentsResponse> {
  const { items, total, page, pageSize } = await OrderPaymentRepo.list({ payload })

  const mappedItems = items.map(mapOrderPaymentPopulatedItem)

  return {
    status: 'success',
    code: 'ORDER_PAYMENTS_FETCHED',
    message: 'Order payments fetched',
    data: {
      items: mappedItems,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function create({ payload, session }: { payload: CreateOrderPaymentsPayload, session?: ClientSession }): Promise<CreateOrderPaymentResponse> {
  const currency = await CurrencyRepo.findOne({ _id: payload.currencyId })

  if (currency === null)
    throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

  const createdOrderPayment = await OrderPaymentRepo.createOne({
    payload: {
      orderId: payload.orderId,
      cashregisterId: payload.cashregisterId,
      cashregisterAccountId: payload.cashregisterAccountId,
      currencyId: payload.currencyId,
      paymentStatus: payload.paymentStatus,
      paymentDate: payload.paymentDate !== undefined ? new Date(payload.paymentDate) : new Date(),
      comment: payload.comment,
      createdBy: payload.createdBy,
      minorAmount: toMinor(payload.amount, currency.scale),
    },
    session,
  })

  if (createdOrderPayment.length === 0)
    throw new HttpError(400, 'Order payment not created', 'ORDER_PAYMENT_NOT_CREATED')

  const orderPayment = await OrderPaymentRepo.getById({ id: createdOrderPayment[0]._id })

  if (!orderPayment)
    throw new HttpError(400, 'Order payment not found', 'ORDER_PAYMENT_NOT_CREATED')

  return {
    status: 'success',
    code: 'ORDER_PAYMENT_CREATED',
    message: 'Order payment created',
    data: mapOrderPaymentToDTO(orderPayment),
  }
}

export async function edit({ payload }: { payload: EditOrderPaymentsPayload }): Promise<EditOrderPaymentResponse> {
  const { id } = payload

  const currency = await CurrencyRepo.findOne({ _id: payload.currencyId })

  if (currency === null)
    throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

  const editedOrderPayment = await OrderPaymentRepo.updateById({
    id,
    payload: {
      ...payload,
      minorAmount: toMinor(payload.amount, currency.scale),
    },
  })

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
