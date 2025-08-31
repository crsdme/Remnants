import type { RequestUser } from '../types/common.type'
import type * as OrderTypes from '../types/order.type'
import path from 'node:path'
import bwipjs from 'bwip-js'
import { values } from 'lodash'
import PDFDocument, { y } from 'pdfkit'
import { v4 as uuidv4 } from 'uuid'
import { STORAGE_PATHS, STORAGE_URLS } from '../config/constants'
import { OrderItemModel, OrderModel, OrderPaymentModel, ProductModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'
import * as AutomationService from './automation.service'
import * as CashregisterService from './cashregister.service'
import * as ExchangeRateService from './currency.service'
import * as MoneyTransactionService from './money-transaction.service'
import * as OrderPaymentService from './order-payment.service'
import * as QuantityService from './quantity.service'
// import * as UserService from './user.service'

export async function get(payload: OrderTypes.getOrdersParams): Promise<OrderTypes.getOrdersResult> {
  const { current = 1, pageSize = 10, full = false } = payload.pagination || {}

  const {
    ids = [],
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
    removed = '',
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
    removed: { type: 'exact' },
  } as const

  const query = buildQuery({
    filters: {
      _id: ids,
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
      removed,
    },
    rules: filterRules,
    removed: false,
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
      $lookup: {
        from: 'order-items',
        localField: '_id',
        foreignField: 'order',
        as: 'orderItems',
      },
    },
    {
      $addFields: {
        orderItems: {
          $filter: {
            input: '$orderItems',
            as: 'item',
            cond: { $ne: ['$$item.removed', true] },
          },
        },
      },
    },
    {
      $addFields: {
        totals: {
          $map: {
            input: {
              $reduce: {
                input: '$orderItems',
                initialValue: [],
                in: {
                  $let: {
                    vars: {
                      existing: {
                        $filter: {
                          input: '$$value',
                          cond: { $eq: ['$$this.currency', '$$this.currency'] },
                        },
                      },
                      currentItem: '$$this',
                      totalPrice: {
                        $round: [
                          {
                            $multiply: [
                              '$$this.quantity',
                              {
                                $let: {
                                  vars: {
                                    basePrice: '$$this.price',
                                    discountAmount: { $ifNull: ['$$this.discountAmount', 0] },
                                    discountPercent: { $ifNull: ['$$this.discountPercent', 0] },
                                  },
                                  in: {
                                    $cond: [
                                      { $gt: ['$$discountPercent', 0] },
                                      {
                                        $subtract: [
                                          '$$basePrice',
                                          {
                                            $divide: [
                                              { $multiply: ['$$basePrice', '$$discountPercent'] },
                                              100,
                                            ],
                                          },
                                        ],
                                      },
                                      { $subtract: ['$$basePrice', '$$discountAmount'] },
                                    ],
                                  },
                                },
                              },
                            ],
                          },
                          2,
                        ],
                      },
                    },
                    in: {
                      $cond: [
                        {
                          $gt: [
                            {
                              $size: {
                                $filter: {
                                  input: '$$value',
                                  as: 'val',
                                  cond: { $eq: ['$$val.currency', '$$this.currency'] },
                                },
                              },
                            },
                            0,
                          ],
                        },
                        {
                          $map: {
                            input: '$$value',
                            as: 'val',
                            in: {
                              $cond: [
                                { $eq: ['$$val.currency', '$$this.currency'] },
                                {
                                  currency: '$$val.currency',
                                  total: { $add: ['$$val.total', '$$totalPrice'] },
                                },
                                '$$val',
                              ],
                            },
                          },
                        },
                        {
                          $concatArrays: [
                            '$$value',
                            [{ currency: '$$this.currency', total: '$$totalPrice' }],
                          ],
                        },
                      ],
                    },
                  },
                },
              },
            },
            as: 'item',
            in: '$$item',
          },
        },
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
        totals: 1,
        orderPayments: 1,
        orderPaymentStatus: 1,
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
        orders: full
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

  const ordersRaw = await OrderModel.aggregate(pipeline).exec()

  const orders = ordersRaw[0].orders
  const ordersCount = ordersRaw[0].totalCount[0]?.count || 0

  for (const order of orders) {
    const orderItems = await getItems({ filters: { order: [order.id] }, pagination: { full: true } })
    order.items = orderItems.orderItems

    const orderPayments = await getOrderPayments({ filters: { order: order.id } })
    order.payments = orderPayments.orderPayments
  }

  return { status: 'success', code: 'ORDERS_FETCHED', message: 'Orders fetched', orders, ordersCount }
}

export async function getItems(payload: OrderTypes.getOrderItemsParams): Promise<OrderTypes.getOrderItemsResult> {
  const { current = 1, pageSize = 10, full = false } = payload.pagination || {}

  const {
    order,
    showFullData = false,
  } = payload.filters || {}

  const filterRules = {
    order: { type: 'array' },
  } as const

  const query = buildQuery({
    filters: { order },
    rules: filterRules,
  })

  let commonProjection: any = {
    _id: 0,
    id: '$_id',
    product: 1,
    quantity: 1,
    price: 1,
    currency: { id: '$currency._id', names: 1, symbols: 1 },
    discountAmount: 1,
    discountPercent: 1,
    transactionId: 1,
    createdAt: 1,
  }

  if (showFullData) {
    commonProjection = {
      ...commonProjection,
      profit: 1,
      exchangeRate: 1,
      purchasePrice: 1,
      purchaseCurrency: { id: '$purchaseCurrency._id', names: 1, symbols: 1 },
    }
  }

  const pipeline = [
    {
      $match: query,
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
        currency: { $arrayElemAt: ['$currency', 0] },
      },
    },
    {
      $project: commonProjection,
    },
    {
      $facet: {
        orderItems: full
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
  const { current = 1, pageSize = 10, full = false } = payload.pagination || {}

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

export async function create(payload: OrderTypes.createOrderParams, user: RequestUser): Promise<OrderTypes.createOrderResult> {
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
    const product = await ProductModel.findOne({ _id: item.product })

    if (!product)
      throw new HttpError(400, 'Product not found', 'PRODUCT_NOT_FOUND')

    const { profit, exchangeRate } = await calculateProfit({
      item,
      purchasePrice: product.purchasePrice,
      purchaseCurrency: product.purchaseCurrency,
    })

    await OrderItemModel.create({
      ...item,
      order: id,
      purchasePrice: product.purchasePrice,
      purchaseCurrency: product.purchaseCurrency,
      profit,
      exchangeRate,
      createdBy: user.id.toString(),
    })
    await QuantityService.count({
      product: item.product,
      count: -item.quantity,
      warehouse: payload.warehouse,
    })
  }

  const totalPrice = Object.values(
    payload.items.reduce((acc: any, item: any) => {
      const { currency, price, quantity } = item

      if (!acc[currency]) {
        acc[currency] = { currency, total: 0 }
      }

      acc[currency].total += price * quantity
      return acc
    }, {}),
  )

  const totalPayments = Object.values(
    orderPayments.reduce((acc: any, payment: any) => {
      const { currency, amount } = payment

      if (!acc[currency]) {
        acc[currency] = { currency, total: 0 }
      }

      acc[currency].total += amount
      return acc
    }, {}),
  )

  const orderPaymentStatus = getPaymentStatus(totalPrice as any, totalPayments as any)

  const order = await OrderModel.create({
    ...payload,
    _id: id,
    orderPayments: createdOrderPayments,
    orderPaymentStatus,
  })

  await AutomationService.run({ type: 'order-created', entityId: order.id, user })

  return { status: 'success', code: 'ORDER_CREATED', message: 'Order created', order }
}

export async function payOrder(payload: OrderTypes.payOrderParams, user: RequestUser): Promise<OrderTypes.payOrderResult> {
  const { id } = payload
  const { orders } = await get({ filters: { ids: [id] } })
  // const { users } = await UserService.get({ filters: { login: user.login } })
  const { cashregisters } = await CashregisterService.get({})

  if (orders.length === 0) {
    throw new HttpError(400, 'Order not found', 'ORDER_NOT_FOUND')
  }

  // if (users.length === 0) {
  //   throw new HttpError(400, 'User not found', 'USER_NOT_FOUND')
  // }
  // const userData = users[0]

  const order = orders[0]

  const payments = mapTotalsToPayments(order.totals, cashregisters[0])

  const createdOrderPayments = []

  for (const payment of payments) {
    const createdOrderPayment = await OrderPaymentService.create({
      order: id,
      cashregister: payment.cashregister,
      cashregisterAccount: payment.cashregisterAccount,
      amount: payment.amount,
      currency: payment.currency,
      createdBy: user.id.toString(),
      paymentStatus: 'paid',
      paymentDate: new Date(),
      comment: '',
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

  function mapTotalsToPayments(totals: { currency: string, total: number }[], cashregister: any) {
    const payments = []

    for (const { currency, total } of totals) {
      const matchingAccount = cashregister.accounts.find((account: any) =>
        account.currencies.some((c: any) => c.id === currency),
      )

      if (!matchingAccount)
        continue

      const matchingCurrency = matchingAccount.currencies.find((c: any) => c.id === currency)

      if (!matchingCurrency)
        continue

      payments.push({
        cashregister: cashregister.id,
        cashregisterAccount: matchingAccount.id,
        currency: matchingCurrency.id,
        amount: total,
      })
    }

    return payments
  }

  await OrderModel.findOneAndUpdate({ _id: id }, { orderPayments: createdOrderPayments, orderPaymentStatus: 'paid' })

  return { status: 'success', code: 'ORDER_PAYED', message: 'Order payed' }
}

export async function edit(payload: OrderTypes.editOrderParams, user: RequestUser): Promise<OrderTypes.editOrderResult> {
  const { id, orderPayments, items } = payload
  const createdOrderPayments = []

  const oldOrderPayments = await OrderPaymentModel.find({ order: id, removed: false })

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

  const oldOrderItems = await OrderItemModel.find({ order: id, removed: false })

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
      const product = await ProductModel.findOne({ _id: item.product })

      if (!product)
        throw new HttpError(400, 'Product not found', 'PRODUCT_NOT_FOUND')

      const { profit, exchangeRate } = await calculateProfit({
        item,
        purchasePrice: product.purchasePrice,
        purchaseCurrency: product.purchaseCurrency,
      })

      await OrderItemModel.create({
        ...item,
        order: id,
        purchasePrice: product.purchasePrice,
        purchaseCurrency: product.purchaseCurrency,
        profit,
        exchangeRate,
        createdBy: user.id.toString(),
      })

      await QuantityService.count({
        product: item.product,
        count: -item.quantity,
        warehouse: payload.warehouse,
      })
    }
  }

  // PAYMENT STATUS

  const totalPrice = Object.values(
    payload.items.reduce((acc: any, item: any) => {
      const { currency, price, quantity } = item

      if (!acc[currency]) {
        acc[currency] = { currency, total: 0 }
      }

      acc[currency].total += price * quantity
      return acc
    }, {}),
  )

  const totalPayments = Object.values(
    orderPayments.reduce((acc: any, payment: any) => {
      const { currency, amount } = payment

      if (!acc[currency]) {
        acc[currency] = { currency, total: 0 }
      }

      acc[currency].total += amount
      return acc
    }, {}),
  )

  const orderPaymentStatus = getPaymentStatus(totalPrice as any, totalPayments as any)

  const order = await OrderModel.findOneAndUpdate({ _id: id }, { ...payload, orderPayments: createdOrderPayments, orderPaymentStatus }, { new: true })

  if (!order) {
    throw new HttpError(400, 'Order not edited', 'ORDER_NOT_EDITED')
  }

  await AutomationService.run({ type: 'order-updated', entityId: order.id, user })

  return { status: 'success', code: 'ORDER_EDITED', message: 'Order edited', order }
}

export async function remove(payload: OrderTypes.removeOrdersParams, user: RequestUser): Promise<OrderTypes.removeOrdersResult> {
  const { ids } = payload

  const orders = await OrderModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!orders) {
    throw new HttpError(400, 'Orders not removed', 'ORDERS_NOT_REMOVED')
  }

  for (const id of ids) {
    await AutomationService.run({ type: 'order-removed', entityId: id, user })
  }

  return { status: 'success', code: 'ORDERS_REMOVED', message: 'Orders removed' }
}

export async function printInvoice(payload: OrderTypes.printInvoiceOrderParams): Promise<OrderTypes.printInvoiceOrderResult> {
  const { seq, language } = payload
  const mm = 2.83464567
  const params = {
    size: [210 * mm, 297 * mm],
    margins: {
      top: 50,
      bottom: 50,
      left: 30,
      right: 30,
    },
  }

  const margins = 30
  const contentWidth = params.size[0] - margins * 2
  // const contentHeight = size.h - padding * 2

  const order = await OrderModel.findOne({ seq })
  if (!order) {
    throw new HttpError(400, 'Order not found', 'ORDER_NOT_FOUND')
  }

  const measureRowHeight = (doc: any, columns: any[], opts?: { pad?: number, imgMaxH?: number, minH?: number }) => {
    const pad = opts?.pad ?? 6
    const imgMaxH = opts?.imgMaxH ?? 70
    let h = opts?.minH ?? 18

    for (const col of columns) {
      if (col.type === 'text') {
        const textH = doc.heightOfString(String(col.value ?? ''), {
          width: Math.max(0, col.width - pad * 2),
          align: col.align || 'left',
        })
        h = Math.max(h, textH + pad * 2)
      }
      else if (col.type === 'image') {
        h = Math.max(h, imgMaxH)
      }
    }
    return h
  }

  const drawTableRow = (doc: any, columns: any[]) => {
    const y = doc.y
    const rowH = measureRowHeight(doc, columns, { imgMaxH: 70, minH: 22 })
    for (const column of columns) {
      if (column.type === 'text') {
        doc.text(column.value, column.x, y, { width: column.width, align: column.align })
      }
      else if (column.type === 'image') {
        doc.image(column.value, column.x, y, {
          width: column.width,
          fit: [Math.max(0, column.width - 6 * 2), Math.max(0, rowH - 6 * 2)],
        })
      }
    }
  }

  const drawHr = (doc: any, gapTopPx = 6, gapBottomPx = 6) => {
    const y = doc.y + gapTopPx
    doc
      .strokeColor('#D9D9D9')
      .lineWidth(1)
      .moveTo(margins, y)
      .lineTo(params.size[0] - margins, y)
      .stroke()
    doc.y = y + gapBottomPx
  }

  const ensureSpace = (doc: any, needPx: number, onNewPage?: () => void) => {
    const pageBottom = doc.page.height - doc.page.margins.bottom
    if (doc.y + needPx > pageBottom) {
      doc.addPage(params)
      if (onNewPage)
        onNewPage()
    }
  }

  const renderTableHeader = (doc: any) => {
    doc.fontSize(10).font('Manrope-Bold')
    const headerRow = [
      { key: 'name', width: 100, x: margins, value: 'Name', align: 'left', type: 'text' },
      { key: 'length', width: 60, x: margins + 100, value: 'Length', align: 'left', type: 'text' },
      { key: 'weight', width: 60, x: margins + 160, value: 'Weight', align: 'left', type: 'text' },
      { key: 'type', width: 100, x: margins + 220, value: 'Type', align: 'left', type: 'text' },
      { key: 'price', width: 80, x: margins + 320, value: 'Price', align: 'left', type: 'text' },
      { key: 'quantity', width: 60, x: margins + 400, value: 'Quantity', align: 'left', type: 'text' },
      { key: 'total', width: 120, x: params.size[0] - margins - 120, value: 'Total', align: 'right', type: 'text' },
    ]
    drawTableRow(doc, headerRow)
    drawHr(doc, 8, 8)
    doc.font('Manrope')
  }

  const doc = new PDFDocument({ autoFirstPage: false })

  doc.addPage(params)

  doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
  doc.registerFont('Manrope-Bold', path.resolve(__dirname, '../utils/fonts/Manrope-ExtraBold.ttf'))

  doc.fontSize(32)
  doc.font('Manrope-Bold')
  doc.text(
    `#${order.seq}`,
    margins,
    doc.y,
    { width: contentWidth, height: 25, align: 'right', ellipsis: true, lineBreak: false },
  )

  drawHr(doc, 8, 8)

  // PRODUCTS

  const { orderItems } = await getItems({ filters: { order: [order.id] }, pagination: { full: true } }) as any

  function getProductPrice(lengthCm: number, type: any[]): number | null {
    const table = [
      { min: 40, max: 44, price: 900 },
      { min: 45, max: 49, price: 950 },
      { min: 50, max: 54, price: 1000 },
      { min: 55, max: 59, price: 1150 },
      { min: 60, max: 64, price: 1200 },
      { min: 65, max: 69, price: 1250 },
      { min: 70, max: 74, price: 1300 },
      { min: 75, max: 79, price: 1350 },
      { min: 80, max: 84, price: 1400 },
      { min: 85, max: 89, price: 1500 },
      { min: 90, max: 94, price: 1600 },
      { min: 95, max: 99, price: 1700 },
    ]

    let multiply = 1

    if (type.includes('822ec142-d144-44fb-ba96-582cff8757b3')) {
      multiply = 1.2
    }
    else if (type.includes('b930fb75-61a6-41c0-88de-0c69082b7f06')) {
      multiply = 1.3
    }
    else if (type.includes('822ec142-d144-44fb-ba96-582cff8757b3') && type.includes('b930fb75-61a6-41c0-88de-0c69082b7f06')) {
      multiply = 1.5
    }

    for (const row of table) {
      if (lengthCm >= row.min && lengthCm <= row.max) {
        return row.price * multiply
      }
    }
    return null
  }

  const products = orderItems.map((item: any) => {
    const type = item.product.productProperties.find((property: any) => property.id === '25144e64-5c4c-47fd-842d-c0a2393f972e')
    const weight = item.product.productProperties.find((property: any) => property.id === '7c3e2c1b-f2bf-4639-baf2-7b1101fa7bf2')?.value
    const length = item.product.productProperties.find((property: any) => property.id === 'efcc3c51-a146-4975-bc5b-196745f76891')?.value

    return {
      name: item.product.names[language],
      length: length || 0,
      weight: weight || 0,
      type: type?.optionData.map((option: any) => option.names[language]).join(', ') || '',
      price: getProductPrice(
        length || 0,
        type?.optionData.map((option: any) => option.value),
      ),
      quantity: item.quantity,
      total: item.price * item.quantity,
      currency: item.currency,
    }
  }).sort((a: any, b: any) => a.length - b.length)

  doc.fontSize(10)
  // const row = [
  //   {
  //     key: 'name',
  //     width: 100,
  //     x: margins,
  //     value: 'Name',
  //     align: 'left',
  //     type: 'text',
  //   },
  //   {
  //     key: 'length',
  //     width: 60,
  //     x: margins + 100,
  //     value: 'Length',
  //     align: 'left',
  //     type: 'text',
  //   },
  //   {
  //     key: 'weight',
  //     width: 60,
  //     x: margins + 100 + 60,
  //     value: 'Weight',
  //     align: 'left',
  //     type: 'text',
  //   },
  //   {
  //     key: 'type',
  //     width: 100,
  //     x: margins + 100 + 60 + 60,
  //     value: 'Type',
  //     align: 'left',
  //     type: 'text',
  //   },
  //   {
  //     key: 'price',
  //     width: 80,
  //     x: margins + 100 + 60 + 60 + 100,
  //     value: 'Price',
  //     align: 'left',
  //     type: 'text',
  //   },
  //   {
  //     key: 'quantity',
  //     width: 60,
  //     x: margins + 100 + 60 + 60 + 100 + 80,
  //     align: 'left',
  //     value: 'Quantity',
  //     type: 'text',
  //   },
  //   {
  //     key: 'total',
  //     width: 120,
  //     x: params.size[0] - margins - 120,
  //     align: 'right',
  //     value: 'Total',
  //     type: 'text',
  //   },
  // ]
  // drawTableRow(doc, row)

  renderTableHeader(doc)

  const totals = { count: 0, weight: 0, amount: {} } as any
  for (const product of products) {
    doc.font('Manrope')
    doc.fontSize(10)
    const row = [
      {
        key: 'name',
        width: 100,
        x: margins,
        value: product.name,
        align: 'left',
        type: 'text',
      },
      {
        key: 'length',
        width: 60,
        x: margins + 100,
        value: `${product.length} cm`,
        align: 'left',
        type: 'text',
      },
      {
        key: 'weight',
        width: 60,
        x: margins + 100 + 60,
        value: `${product.weight} g`,
        align: 'left',
        type: 'text',
      },
      {
        key: 'type',
        width: 100,
        x: margins + 100 + 60 + 60,
        value: `${product.type}`,
        align: 'left',
        type: 'text',
      },
      {
        key: 'price',
        width: 80,
        x: margins + 100 + 60 + 60 + 100,
        value: `${product.price} ${product.currency.symbols[language] || ''}`,
        align: 'left',
        type: 'text',
      },
      {
        key: 'quantity',
        width: 60,
        x: margins + 100 + 60 + 60 + 100 + 80,
        value: `${product.quantity} pcs`,
        align: 'left',
        type: 'text',
      },
      {
        key: 'total',
        width: 120,
        x: params.size[0] - margins - 120,
        value: `${product.total} ${product.currency.symbols[language] || ''}`,
        align: 'right',
        type: 'text',
      },
    ]

    const rowH = measureRowHeight(doc, row, { imgMaxH: 70, minH: 22 })
    const hrH = 12
    const need = rowH + hrH

    ensureSpace(doc, need, () => renderTableHeader(doc))

    totals.count += product.quantity
    totals.weight += product.weight
    if (!totals.amount[product.currency.id]) {
      totals.amount[product.currency.id] = { currency: product.currency, total: 0 }
    }
    totals.amount[product.currency.id].total += product.total
    drawTableRow(doc, row)
    drawHr(doc, 8, 8)
  }

  const totalRow = [
    {
      key: 'name',
      width: 100,
      x: margins,
      value: '',
      align: 'left',
      type: 'text',
    },
    {
      key: 'length',
      width: 60,
      x: margins + 100,
      value: '',
      align: 'left',
      type: 'text',
    },
    {
      key: 'weight',
      width: 60,
      x: margins + 100 + 60,
      value: `${totals.weight} g`,
      align: 'left',
      type: 'text',
    },
    {
      key: 'type',
      width: 100,
      x: margins + 100 + 60 + 60,
      value: '',
      align: 'left',
      type: 'text',
    },
    {
      key: 'price',
      width: 80,
      x: margins + 100 + 60 + 60 + 100,
      value: ``,
      align: 'left',
      type: 'text',
    },
    {
      key: 'quantity',
      width: 60,
      x: margins + 100 + 60 + 60 + 100 + 80,
      align: 'left',
      value: `${totals.count} pcs`,
      type: 'text',
    },
    {
      key: 'total',
      width: 120,
      x: params.size[0] - margins - 120,
      align: 'right',
      value: Object.values(totals.amount).map((amount: any) => `${amount.total} ${amount.currency.symbols[language] || ''}`).join(', '),
      type: 'text',
    },
  ]

  doc.font('Manrope-Bold')
  drawTableRow(doc, totalRow)

  // const productsText = barcode.products.map((product: any) => product.names[language] || '').join(', ')

  // doc.text(
  //   productsText,
  //   padding,
  //   doc.y,
  //   { width: contentWidth, height: 50, ellipsis: true, lineBreak: false },
  // )

  return { status: 'success', code: 'INVOICE_PRINTED', message: 'Invoice printed', doc }
}

async function convertCurrency({
  amount,
  fromCurrencyId,
  toCurrencyId,
}: {
  amount: number
  fromCurrencyId: string
  toCurrencyId: string
}): Promise<{ convertedAmount: number, rate: number }> {
  if (fromCurrencyId === toCurrencyId) {
    return { convertedAmount: amount, rate: 1 }
  }

  const { exchangeRates } = await ExchangeRateService.getExchangeRates({
    filters: { fromCurrency: fromCurrencyId, toCurrency: toCurrencyId },
  })

  if (!exchangeRates || !exchangeRates.length) {
    throw new Error(`Exchange rate not found from ${fromCurrencyId} to ${toCurrencyId}`)
  }

  const rate = exchangeRates[0].rate

  return { convertedAmount: Number.parseFloat((amount * rate).toFixed(2)), rate }
}

async function calculateProfit({
  item,
  purchasePrice,
  purchaseCurrency,
}: {
  item: any
  purchasePrice: number
  purchaseCurrency: string
}): Promise<{ profit: number, exchangeRate: number }> {
  const sellingCurrency = item.currency
  let sellingPrice = item.price

  if (item.discountPercent && item.discountPercent > 0) {
    sellingPrice -= (sellingPrice * item.discountPercent) / 100
  }
  else if (item.discountAmount && item.discountAmount > 0) {
    sellingPrice -= item.discountAmount
  }

  let convertedPurchasePrice = purchasePrice
  let exchangeRate = 1

  if (purchaseCurrency !== sellingCurrency) {
    const { convertedAmount, rate } = await convertCurrency({
      amount: purchasePrice,
      fromCurrencyId: purchaseCurrency,
      toCurrencyId: sellingCurrency,
    })

    convertedPurchasePrice = convertedAmount
    exchangeRate = rate
  }

  const unitProfit = sellingPrice - convertedPurchasePrice
  const profit = unitProfit * item.quantity

  return { profit: Number.parseFloat(profit.toFixed(2)), exchangeRate }
}

export function getPaymentStatus(
  prices: { currency: string, total: number }[],
  payments: { currency: string, total: number }[],
  epsilon = 0,
): 'paid' | 'unpaid' | 'partially_paid' | 'overpaid' {
  const priceByCurrency = new Map(prices.map(p => [p.currency, p.total]))
  const paymentByCurrency = new Map(payments.map(p => [p.currency, p.total]))

  let hasPayments = false
  let allMatch = true
  let hasOver = false

  for (const [currency, priceTotal] of priceByCurrency) {
    const paymentTotal = paymentByCurrency.get(currency) ?? 0

    if (paymentTotal > 0)
      hasPayments = true

    if (Math.abs(priceTotal - paymentTotal) <= epsilon) {
      continue
    }
    else if (paymentTotal < priceTotal) {
      allMatch = false
    }
    else if (paymentTotal > priceTotal) {
      hasOver = true
      allMatch = false
    }
  }

  if (allMatch && hasPayments)
    return 'paid'
  if (!hasPayments)
    return 'unpaid'
  if (hasOver)
    return 'overpaid'
  return 'partially_paid'
}
