import type * as OrderTypes from '../types/order.type'
import type { User } from '../types/user.type'
import { v4 as uuidv4 } from 'uuid'
import { STORAGE_URLS } from '../config/constants'
import { OrderItemModel, OrderModel, OrderPaymentModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'
import * as AutomationService from './automation.service'
import * as MoneyTransactionService from './money-transaction.service'
import * as OrderPaymentService from './order-payment.service'
import * as QuantityService from './quantity.service'

export async function get(payload: OrderTypes.getOrdersParams): Promise<OrderTypes.getOrdersResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    seq = '',
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

  let orderStatusQuery = orderStatus

  if (orderStatus === 'all')
    orderStatusQuery = ''

  const filterRules = {
    _id: { type: 'array' },
    seq: { type: 'number' },
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
    filters: {
      seq,
      warehouse,
      deliveryService,
      orderSource,
      orderStatus: orderStatusQuery,
      orderPayments,
      client,
      comment,
      createdBy,
      confirmedBy,
      removedBy,
      createdAt,
      updatedAt,
    },
    rules: filterRules,
  })

  const sorters = buildSortQuery(payload.sorters || {}, { seq: -1 })

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
        orderStatus: { id: '$orderStatus._id', names: 1, type: 1, color: 1, isLocked: 1 },
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

  for (const order of orders) {
    const orderItems = await getItems({ filters: { order: order.id } })
    order.items = orderItems.orderItems

    const orderPayments = await getOrderPayments({ filters: { order: order.id } })
    order.payments = orderPayments.orderPayments
  }

  return { status: 'success', code: 'ORDERS_FETCHED', message: 'Orders fetched', orders, ordersCount }
}

export async function getItems(payload: OrderTypes.getOrderItemsParams): Promise<OrderTypes.getOrderItemsResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    order,
  } = payload.filters || {}

  const filterRules = {
    order: { type: 'string' },
  } as const

  const query = buildQuery({
    filters: { order },
    rules: filterRules,
    removed: false,
  })

  const pipeline = [
    {
      $match: query,
    },
    {
      $lookup: {
        from: 'products',
        let: { productId: '$product' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$productId'] } } },
          { $unwind: { path: '$productProperties', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'product-properties',
              localField: 'productProperties._id',
              foreignField: '_id',
              as: 'productProperties.data',
            },
          },
          {
            $lookup: {
              from: 'product-property-options',
              localField: 'productProperties.value',
              foreignField: '_id',
              as: 'productProperties.optionData',
            },
          },
          {
            $lookup: {
              from: 'product-property-options',
              let: { valueArr: '$productProperties.value' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: [
                        '$_id',
                        {
                          $cond: [
                            { $isArray: ['$$valueArr'] },
                            '$$valueArr',
                            [{ $ifNull: ['$$valueArr', null] }],
                          ],
                        },
                      ],
                    },
                  },
                },
              ],
              as: 'productProperties.optionData',
            },
          },
          {
            $group: {
              _id: '$_id',
              doc: { $first: '$$ROOT' },
              productProperties: { $push: '$productProperties' },
            },
          },
          {
            $addFields: {
              'doc.productProperties': '$productProperties',
            },
          },
          {
            $replaceRoot: {
              newRoot: '$doc',
            },
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
            $lookup: {
              from: 'currencies',
              localField: 'purchaseCurrency',
              foreignField: '_id',
              as: 'purchaseCurrency',
            },
          },
          {
            $lookup: {
              from: 'units',
              localField: 'unit',
              foreignField: '_id',
              as: 'unit',
            },
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'categories',
              foreignField: '_id',
              as: 'categories',
            },
          },
          {
            $lookup: {
              from: 'quantities',
              localField: 'quantity',
              foreignField: '_id',
              as: 'quantity',
            },
          },
          {
            $lookup: {
              from: 'product-property-groups',
              localField: 'productPropertiesGroup',
              foreignField: '_id',
              as: 'productPropertiesGroup',
            },
          },
          {
            $lookup: {
              from: 'barcodes',
              localField: 'barcodes',
              foreignField: '_id',
              as: 'barcodes',
            },
          },
          {
            $addFields: {
              currency: { $arrayElemAt: ['$currency', 0] },
              purchaseCurrency: { $arrayElemAt: ['$purchaseCurrency', 0] },
              unit: { $arrayElemAt: ['$unit', 0] },
              productPropertiesGroup: { $arrayElemAt: ['$productPropertiesGroup', 0] },
              productProperties: {
                $map: {
                  input: '$productProperties',
                  as: 'prop',
                  in: {
                    $mergeObjects: [
                      '$$prop',
                      {
                        id: '$$prop._id',
                        data: { $arrayElemAt: ['$$prop.data', 0] },
                        optionData: {
                          $map: {
                            input: '$$prop.optionData',
                            as: 'option',
                            in: {
                              $mergeObjects: [
                                '$$option',
                                {
                                  id: '$$option._id',
                                  names: '$$option.names',
                                  color: '$$option.color',
                                },
                              ],
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
              categories: {
                $map: {
                  input: '$categories',
                  as: 'prop',
                  in: {
                    $mergeObjects: [
                      '$$prop',
                      {
                        id: '$$prop._id',
                      },
                    ],
                  },
                },
              },
              barcodes: {
                $map: {
                  input: '$barcodes',
                  as: 'barcode',
                  in: { $mergeObjects: ['$$barcode', { id: '$$barcode._id', code: '$$barcode.code' }] },
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              seq: 1,
              names: 1,
              price: 1,
              currency: { id: '$currency._id', names: 1, symbols: 1 },
              purchasePrice: 1,
              purchaseCurrency: { id: '$purchaseCurrency._id', names: 1, symbols: 1 },
              barcodes: { id: 1, code: 1 },
              categories: { id: 1, names: 1 },
              unit: { id: '$unit._id', names: 1, symbols: 1 },
              quantity: { count: 1, warehouse: 1, status: 1 },
              images: 1,
              productProperties: { id: 1, value: 1, data: { names: 1, type: 1, isRequired: 1, showInTable: 1 }, optionData: { id: 1, names: 1, color: 1 } },
              productPropertiesGroup: { id: '$productPropertiesGroup._id', names: 1 },
              createdAt: 1,
              updatedAt: 1,
              id: '$_id',
            },
          },
        ],
        as: 'product',
      },
    },
    {
      $addFields: {
        product: {
          $first: '$product',
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        product: 1,
        quantity: 1,
        transactionId: 1,
        createdAt: 1,
      },
    },
    {
      $facet: {
        orderItems: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const orderItemsRaw = await OrderItemModel.aggregate(pipeline).exec()

  let orderItems = orderItemsRaw[0].orderItems || []
  const orderItemsCount = orderItemsRaw[0].totalCount[0]?.count || 0

  orderItems = orderItems.map((item: any) => ({
    ...item,
    product: {
      ...item.product,
      images: item.product.images.map((image: any) => ({
        id: image._id,
        path: `${STORAGE_URLS.productImages}/${image.filename}`,
        filename: image.filename,
        name: image.name,
        type: image.type,
      })),
    },
  }))

  return { status: 'success', code: 'ORDER_ITEMS_FETCHED', message: 'Order items fetched', orderItems, orderItemsCount }
}

export async function getOrderPayments(payload: OrderTypes.getOrderPaymentsParams): Promise<OrderTypes.getOrderPaymentsResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    order,
  } = payload.filters || {}

  const filterRules = {
    order: { type: 'string' },
  } as const

  const query = buildQuery({
    filters: { order },
    rules: filterRules,
  })

  const pipeline = [
    {
      $match: query,
    },
    {
      $lookup: {
        from: 'cashregisters',
        localField: 'cashregister',
        foreignField: '_id',
        as: 'cashregister',
      },
    },
    {
      $lookup: {
        from: 'cashregister-accounts',
        localField: 'cashregisterAccount',
        foreignField: '_id',
        as: 'cashregisterAccount',
      },
    },
    {
      $lookup: {
        from: 'moneytransactions',
        localField: 'transaction',
        foreignField: '_id',
        as: 'transaction',
      },
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
        cashregister: { $arrayElemAt: ['$cashregister', 0] },
        cashregisterAccount: { $arrayElemAt: ['$cashregisterAccount', 0] },
        transaction: { $arrayElemAt: ['$transaction', 0] },
        currency: { $arrayElemAt: ['$currency', 0] },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        order: 1,
        cashregister: { id: '$cashregister._id', names: '$cashregister.names' },
        cashregisterAccount: { id: '$cashregisterAccount._id', names: '$cashregisterAccount.names' },
        transaction: { id: '$transaction._id', type: '$transaction.type', amount: '$transaction.amount' },
        currency: { id: '$currency._id', names: 1, symbols: 1 },
        amount: 1,
        paymentStatus: 1,
        paymentDate: 1,
        comment: 1,
        createdAt: 1,
        updatedAt: 1,
      },
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

  const orderPayments = orderPaymentsRaw[0].orderPayments || []
  const orderPaymentsCount = orderPaymentsRaw[0].totalCount[0]?.count || 0

  return {
    status: 'success',
    code: 'ORDER_PAYMENTS_FETCHED',
    message: 'Order payments fetched',
    orderPayments,
    orderPaymentsCount,
  }
}

export async function create(payload: OrderTypes.createOrderParams, user: User): Promise<OrderTypes.createOrderResult> {
  const { orderPayments } = payload
  const createdOrderPayments = []
  const id = uuidv4()

  if (orderPayments.length > 0) {
    for (const payment of orderPayments) {
      const createdOrderPayment = await OrderPaymentService.create({
        ...payment,
        order: id,
        createdBy: user.id.toString(),
      })
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

  const order = await OrderModel.create({ ...payload, _id: id, orderPayments: createdOrderPayments })

  await AutomationService.run({ type: 'order-created', entityId: order.id })

  return { status: 'success', code: 'ORDER_CREATED', message: 'Order created', order }
}

export async function edit(payload: OrderTypes.editOrderParams, user: User): Promise<OrderTypes.editOrderResult> {
  const { id, orderPayments, items } = payload
  const createdOrderPayments = []

  const oldOrderPayments = await OrderPaymentModel.find({ order: id })

  // CANCELLED OLD PAYMENTS
  if (oldOrderPayments.length > 0) {
    for (const payment of oldOrderPayments) {
      await OrderPaymentModel.updateOne(
        { _id: payment.id },
        { $set: {
          removed: true,
          removedBy: user.id.toString(),
          paymentStatus: 'cancelled',
        } },
      )

      await MoneyTransactionService.create({
        type: 'income',
        direction: 'out',
        account: payment.cashregisterAccount,
        cashregister: payment.cashregister,
        sourceModel: 'order',
        sourceId: id,
        currency: payment.currency,
        amount: payment.amount,
        description: `Cancelled payment for order ${id}`,
      })
    }
  }

  // CREATED NEW PAYMENTS
  if (orderPayments.length > 0) {
    for (const payment of orderPayments) {
      const createdOrderPayment = await OrderPaymentService.create({
        ...payment,
        order: id,
        createdBy: user.id.toString(),
      })

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

  const oldOrderItems = await OrderItemModel.find({ order: id })

  // CANCELLED OLD ITEMS
  if (oldOrderItems.length > 0) {
    for (const item of oldOrderItems) {
      await OrderItemModel.updateOne(
        { _id: item.id },
        { $set: {
          removed: true,
          removedBy: user.id.toString(),
        } },
      )

      await QuantityService.count({
        product: item.product,
        count: item.quantity,
        warehouse: payload.warehouse,
      })
    }
  }

  // CREATED NEW ITEMS
  if (items.length > 0) {
    for (const item of items) {
      await OrderItemModel.create({
        ...item,
        order: id,
      })
      await QuantityService.count({
        product: item.product,
        count: -item.quantity,
        warehouse: payload.warehouse,
      })
    }
  }

  const order = await OrderModel.findOneAndUpdate({ _id: id }, { ...payload, orderPayments: createdOrderPayments }, { new: true })

  if (!order) {
    throw new HttpError(400, 'Order not edited', 'ORDER_NOT_EDITED')
  }

  await AutomationService.run({ type: 'order-updated', entityId: order.id })

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
