import type * as OrderPaymentTypes from '../types/order-payment.type'
import { OrderPaymentModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: OrderPaymentTypes.getOrderPaymentsParams): Promise<OrderPaymentTypes.getOrderPaymentsResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    order = '',
    cashregister = '',
    cashregisterAccount = '',
    amount = 0,
    currency = '',
    paymentStatus = '',
    paymentDate = {
      from: undefined,
      to: undefined,
    },
    transaction = '',
    createdBy = '',
    removedBy = '',
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
    order: { type: 'string' },
    cashregister: { type: 'string' },
    cashregisterAccount: { type: 'string' },
    amount: { type: 'number' },
    currency: { type: 'string' },
    paymentStatus: { type: 'string' },
    paymentDate: { type: 'dateRange' },
    transaction: { type: 'string' },
    createdBy: { type: 'string' },
    removedBy: { type: 'string' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { order, cashregister, cashregisterAccount, amount, currency, paymentStatus, paymentDate, transaction, createdBy, removedBy, createdAt, updatedAt },
    rules: filterRules,
  })

  const sorters = buildSortQuery(payload.sorters || {}, { createdAt: 1 })

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $facet: {
        orderPayments: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const orderPaymentsRaw = await OrderPaymentModel.aggregate(pipeline).exec()

  const orderPayments = orderPaymentsRaw[0].orderPayments.map((doc: any) => OrderPaymentModel.hydrate(doc))
  const orderPaymentsCount = orderPaymentsRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'ORDER_PAYMENTS_FETCHED', message: 'Order payments fetched', orderPayments, orderPaymentsCount }
}

export async function create(payload: OrderPaymentTypes.createOrderPaymentParams): Promise<OrderPaymentTypes.createOrderPaymentResult> {
  const orderPayment = await OrderPaymentModel.create(payload)

  return { status: 'success', code: 'ORDER_PAYMENT_CREATED', message: 'Order payment created', orderPayment }
}

export async function edit(payload: OrderPaymentTypes.editOrderPaymentParams): Promise<OrderPaymentTypes.editOrderPaymentResult> {
  const { id } = payload

  const orderPayment = await OrderPaymentModel.findOneAndUpdate({ _id: id }, payload)

  if (!orderPayment) {
    throw new HttpError(400, 'Order payment not edited', 'ORDER_PAYMENT_NOT_EDITED')
  }

  return { status: 'success', code: 'ORDER_PAYMENT_EDITED', message: 'Order payment edited', orderPayment }
}

export async function remove(payload: OrderPaymentTypes.removeOrderPaymentsParams): Promise<OrderPaymentTypes.removeOrderPaymentsResult> {
  const { ids } = payload

  const orderPayments = await OrderPaymentModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!orderPayments) {
    throw new HttpError(400, 'Order payments not removed', 'ORDER_PAYMENTS_NOT_REMOVED')
  }

  return { status: 'success', code: 'ORDER_PAYMENTS_REMOVED', message: 'Order payments removed' }
}
