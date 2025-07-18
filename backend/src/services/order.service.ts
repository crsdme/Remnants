import type * as OrderTypes from '../types/order.type'
import type { User } from '../types/user.type'
import { v4 as uuidv4 } from 'uuid'
import { OrderItemModel, OrderModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'
import * as MoneyTransactionService from './money-transaction.service'
import * as OrderPaymentService from './order-payment.service'
import * as QuantityService from './quantity.service'

export async function get(payload: OrderTypes.getOrdersParams): Promise<OrderTypes.getOrdersResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    warehouse = '',
    deliveryService = '',
    orderSource = '',
    orderStatus = '',
    orderPayments = '',
    client = '',
    comment = '',
    createdBy = '',
    confirmedBy = '',
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
    warehouse: { type: 'string' },
    deliveryService: { type: 'string' },
    orderSource: { type: 'string' },
    orderStatus: { type: 'string' },
    orderPayments: { type: 'string' },
    client: { type: 'string' },
    comment: { type: 'string' },
    createdBy: { type: 'string' },
    removedBy: { type: 'string' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { warehouse, deliveryService, orderSource, orderStatus, orderPayments, client, comment, createdBy, confirmedBy, removedBy, createdAt, updatedAt },
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
        from: 'clients',
        localField: 'client',
        foreignField: '_id',
        as: 'client',
      },
    },
    {
      $lookup: {
        from: 'delivery-services',
        localField: 'deliveryService',
        foreignField: '_id',
        as: 'deliveryService',
      },
    },
    {
      $lookup: {
        from: 'order-sources',
        localField: 'orderSource',
        foreignField: '_id',
        as: 'orderSource',
      },
    },
    {
      $lookup: {
        from: 'order-statuses',
        localField: 'orderStatus',
        foreignField: '_id',
        as: 'orderStatus',
      },
    },
    {
      $lookup: {
        from: 'warehouses',
        localField: 'warehouse',
        foreignField: '_id',
        as: 'warehouse',
      },
    },
    {
      $lookup: {
        from: 'order-payments',
        localField: 'orderPayments',
        foreignField: '_id',
        as: 'orderPayments',
      },
    },
    {
      $addFields: {
        client: { $arrayElemAt: ['$client', 0] },
        deliveryService: { $arrayElemAt: ['$deliveryService', 0] },
        orderSource: { $arrayElemAt: ['$orderSource', 0] },
        orderStatus: { $arrayElemAt: ['$orderStatus', 0] },
        warehouse: { $arrayElemAt: ['$warehouse', 0] },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        seq: 1,
        client: { id: '$client._id', name: 1, lastName: 1, middleName: 1, phones: 1, emails: 1 },
        deliveryService: { id: '$deliveryService._id', names: 1, type: 1, color: 1 },
        orderSource: { id: '$orderSource._id', names: 1, type: 1, color: 1 },
        orderStatus: { id: '$orderStatus._id', names: 1, type: 1, color: 1 },
        warehouse: { id: '$warehouse._id', names: 1 },
        orderPayments: 1,
        comment: 1,
        createdAt: 1,
        updatedAt: 1,
        createdBy: 1,
        confirmedBy: 1,
        removedBy: 1,
      },
    },
    {
      $facet: {
        orders: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const ordersRaw = await OrderModel.aggregate(pipeline).exec()

  const orders = ordersRaw[0].orders
  const ordersCount = ordersRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'ORDERS_FETCHED', message: 'Orders fetched', orders, ordersCount }
}

export async function create(payload: OrderTypes.createOrderParams, user: User): Promise<OrderTypes.createOrderResult> {
  const { orderPayments } = payload
  const createdOrderPayments = []
  const id = uuidv4()

  if (orderPayments.length > 0) {
    for (const payment of orderPayments) {
      const mappedPayment = {
        ...payment,
        order: id,
        createdBy: user.id.toString(),
      }
      const createdOrderPayment = await OrderPaymentService.create(mappedPayment)
      createdOrderPayments.push(createdOrderPayment.orderPayment.id)

      await MoneyTransactionService.create({
        type: 'income',
        direction: 'in',
        account: payment.cashregisterAccount,
        cashregister: payment.cashregister,
        sourceModel: 'order',
        sourceId: id,
        currency: payment.currency,
        amount: payment.amount,
        description: `Payment for order ${id}`,
      })
    }
  }

  for (const item of payload.items) {
    const mappedItem = {
      ...item,
      order: id,
    }
    await OrderItemModel.create(mappedItem)
    await QuantityService.count({
      product: item.product,
      count: -item.quantity,
      warehouse: payload.warehouse,
    })
  }

  const order = await OrderModel.create({ ...payload, orderPayments: createdOrderPayments })

  return { status: 'success', code: 'ORDER_CREATED', message: 'Order created', order }
}

export async function edit(payload: OrderTypes.editOrderParams): Promise<OrderTypes.editOrderResult> {
  const { id } = payload

  const order = await OrderModel.findOneAndUpdate({ _id: id }, payload)

  if (!order) {
    throw new HttpError(400, 'Order not edited', 'ORDER_NOT_EDITED')
  }

  return { status: 'success', code: 'ORDER_EDITED', message: 'Order edited', order }
}

export async function remove(payload: OrderTypes.removeOrdersParams): Promise<OrderTypes.removeOrdersResult> {
  const { ids } = payload

  const orders = await OrderModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!orders) {
    throw new HttpError(400, 'Orders not removed', 'ORDERS_NOT_REMOVED')
  }

  return { status: 'success', code: 'ORDERS_REMOVED', message: 'Orders removed' }
}
