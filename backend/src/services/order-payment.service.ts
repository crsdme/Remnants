import type { ClientSession } from 'mongoose'
import type * as OrderPaymentTypes from '../types/order-payment.type'
import { OrderPaymentModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: OrderPaymentTypes.getOrderPaymentsParams): Promise<OrderPaymentTypes.getOrderPaymentsResult> {
  const { current = 1, pageSize = 10, full = false } = payload.pagination || {}

  const {
    order = [],
    cashregister = '',
    cashregisterAccount = '',
    currency = '',
    paymentStatus = '',
    paymentDate = {
      from: undefined,
      to: undefined,
    },
    transaction = '',
    createdBy = '',
    removedBy = '',
    removed = '',
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
    order: { type: 'array' },
    cashregister: { type: 'string' },
    cashregisterAccount: { type: 'string' },
    currency: { type: 'string' },
    paymentStatus: { type: 'string' },
    paymentDate: { type: 'dateRange' },
    transaction: { type: 'string' },
    createdBy: { type: 'string' },
    removedBy: { type: 'string' },
    removed: { type: 'exact' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { order, cashregister, cashregisterAccount, currency, paymentStatus, paymentDate, transaction, createdBy, removedBy, createdAt, updatedAt, removed },
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
      $lookup: {
        from: 'currencies',
        localField: 'currency',
        foreignField: '_id',
        as: 'currency',
      },
    },
    {
      $addFields: {
        currency: { $arrayElemAt: ['$currency', 0] },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        order: 1,
        cashregister: 1,
        cashregisterAccount: 1,
        currency: { id: '$currency._id', names: 1, symbols: 1 },
        amount: 1,
        paymentStatus: 1,
        paymentDate: 1,
        transaction: 1,
        comment: 1,
        createdAt: 1,
        updatedAt: 1,
        createdBy: 1,
        removedBy: 1,
        removed: 1,
      },
    },
    {
      $facet: {
        orderPayments: full
          ? []
          : [
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

  const orderPayments = orderPaymentsRaw[0].orderPayments
  const orderPaymentsCount = orderPaymentsRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'ORDER_PAYMENTS_FETCHED', message: 'Order payments fetched', orderPayments, orderPaymentsCount }
}

export async function create(payload: OrderPaymentTypes.createOrderPaymentParams, session?: ClientSession): Promise<OrderPaymentTypes.createOrderPaymentResult> {
  const orderPayment = await OrderPaymentModel.create([payload], { session })

  return { status: 'success', code: 'ORDER_PAYMENT_CREATED', message: 'Order payment created', orderPayment: orderPayment[0] }
}

export async function edit(payload: OrderPaymentTypes.editOrderPaymentParams, session?: ClientSession): Promise<OrderPaymentTypes.editOrderPaymentResult> {
  const { id } = payload

  const orderPayment = await OrderPaymentModel.findOneAndUpdate({ _id: id }, payload, { session })

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
