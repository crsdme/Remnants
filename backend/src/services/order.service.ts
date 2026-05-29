import type { ClientSession } from 'mongoose'
import type { Client } from '../types/client.type'
import type { RequestUser } from '../types/common.type'
import type * as OrderPaymentTypes from '../types/order-payment.type'
import type { Order } from '../types/order.type'
import type * as OrderTypes from '../types/order.type'
import type * as UserTypes from '../types/user.type'
import path from 'node:path'
import mongoose from 'mongoose'
import PDFDocument from 'pdfkit'
import { v4 as uuidv4 } from 'uuid'
import { STORAGE_URLS } from '../config/constants'
import { OrderItemModel, OrderModel, OrderPaymentModel, ProductModel } from '../models'
import { getDifferenceDeep } from '../utils/getDiff'
import { HttpError } from '../utils/httpError'
import { getHardcodeData } from '../utils/mongodb/hardcode'
import { drawHr } from '../utils/pdf'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'
import * as AutomationService from './automation.service'
import * as CashregisterService from './cashregister.service'
import * as ExchangeRateService from './currency.service'
import * as MoneyTransactionService from './money-transaction.service'
import * as OrderPaymentService from './order-payment.service'
import * as QuantityService from './quantity.service'
import * as UserService from './user.service'

export async function get(payload: OrderTypes.getOrdersParams, user?: UserTypes.User): Promise<OrderTypes.getOrdersResult> {
  const { current = 1, pageSize = 10, full = false } = payload.pagination || {}

  const hasProfitPermission = await UserService.checkUserPermissions('order.profit', user)

  const {
    ids = [],
    seq = '',
    warehouse = '',
    deliveryService = '',
    orderSource = '',
    orderStatus = [],
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
  if (orderStatus.includes('all'))
    orderStatusQuery = []

  const filterRules = {
    _id: { type: 'array' },
    seq: { type: 'number' },
    warehouse: { type: 'string' },
    deliveryService: { type: 'string' },
    orderSource: { type: 'string' },
    orderStatus: { type: 'array' },
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
      $lookup: {
        from: 'order-items',
        let: { oid: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$order', '$$oid'] }, { $ne: ['$removed', true] }] } } },
          { $addFields: {
            curKey: { $ifNull: ['$currency.id', { $ifNull: ['$currency._id', '$currency'] }] },
            lineTotal: {
              $multiply: [
                { $toDouble: { $ifNull: ['$price', 0] } },
                { $toDouble: { $ifNull: ['$quantity', 0] } },
              ],
            },
          } },
          { $group: {
            _id: '$curKey',
            currency: { $last: '$currency' },
            total: { $sum: '$lineTotal' },
          } },
          { $project: { _id: 0, currency: 1, total: 1 } },
        ],
        as: 'totals',
      },
    },
    ...(hasProfitPermission
      ? [{
          $lookup: {
            from: 'order-items',
            let: { oid: '$_id' },
            pipeline: [
              { $match: { $expr: { $and: [{ $eq: ['$order', '$$oid'] }, { $ne: ['$removed', true] }] } } },
              { $addFields: {
                curKey: { $ifNull: ['$currency.id', { $ifNull: ['$currency._id', '$currency'] }] },
                lineTotal: {
                  $multiply: [
                    { $toDouble: { $ifNull: ['$profit', 0] } },
                    { $toDouble: { $ifNull: ['$quantity', 0] } },
                  ],
                },
              } },
              { $group: {
                _id: '$curKey',
                currency: { $last: '$currency' },
                total: { $sum: '$lineTotal' },
              } },
              { $project: { _id: 0, currency: 1, total: 1 } },
            ],
            as: 'profit',
          },
        }]
      : []),
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
        profit: 1,
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
    const orderItems = await getItems({ filters: { order: [order.id], showFullData: hasProfitPermission }, pagination: { full: true } })
    order.items = orderItems.orderItems

    const orderPayments = await getOrderPayments({ filters: { order: order.id } })
    order.payments = orderPayments.orderPayments
  }

  return { status: 'success', code: 'ORDERS_FETCHED', message: 'Orders fetched', orders, ordersCount }
}

export async function getItems(payload: OrderTypes.getOrderItemsParams, session?: ClientSession): Promise<OrderTypes.getOrderItemsResult> {
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
    order: 1,
    product: 1,
    quantity: 1,
    price: 1,
    manualPrice: 1,
    basePrice: 1,
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
              order: 1,
              currency: { id: '$currency._id', names: 1, symbols: 1 },
              purchasePrice: 1,
              purchaseCurrency: { id: '$purchaseCurrency._id', names: 1, symbols: 1 },
              barcodes: { id: 1, code: 1 },
              categories: { id: 1, names: 1 },
              unit: { id: '$unit._id', names: 1, symbols: 1 },
              quantity: { count: 1, warehouse: 1, status: 1 },
              images: 1,
              productProperties: { id: 1, value: 1, data: { names: 1, symbols: 1, type: 1, isRequired: 1, showInTable: 1, showInStatistics: 1 }, optionData: { id: 1, names: 1, color: 1 } },
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

  const aggregate = OrderItemModel.aggregate(pipeline)

  if (session) {
    aggregate.session(session)
  }

  const orderItemsRaw = await aggregate.exec()

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
      userId: user.id.toString(),
      refType: 'order',
      refId: id,
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
  const session = await mongoose.startSession()

  try {
    let editedOrder: any = null

    await session.withTransaction(async () => {
      const { id, items, orderPayments, warehouse } = payload
      const userId = user.id.toString()

      await applyItemsDiff({
        orderId: id,
        warehouseId: warehouse,
        items,
        userId,
        session,
      })

      const activePaymentIds = await applyPaymentsDiff({
        orderId: id,
        payments: orderPayments,
        userId,
        session,
      })

      const [dbItems, dbPayments] = await Promise.all([
        OrderItemModel.find(
          { order: id, removed: false },
          null,
          { session },
        ),
        OrderPaymentModel.find(
          { order: id, removed: false },
          null,
          { session },
        ),
      ])

      const totalPriceByCurrency = Object.values(
        dbItems.reduce((acc: any, item: any) => {
          const currency = item.currency.toString()
          if (!acc[currency]) {
            acc[currency] = { currency, total: 0 }
          }
          acc[currency].total += item.price * item.quantity
          return acc
        }, {}),
      )

      const totalPaymentsByCurrency = Object.values(
        dbPayments.reduce((acc: any, payment: any) => {
          const currency = payment.currency.toString()
          if (!acc[currency]) {
            acc[currency] = { currency, total: 0 }
          }
          acc[currency].total += payment.amount
          return acc
        }, {}),
      )

      const orderPaymentStatus = getPaymentStatus(
        totalPriceByCurrency as any,
        totalPaymentsByCurrency as any,
      )

      const order = await OrderModel.findOneAndUpdate(
        { _id: id },
        {
          ...payload,
          orderPayments: activePaymentIds,
          orderPaymentStatus,
        },
        { new: true, session },
      )

      if (!order)
        throw new HttpError(400, 'Order not edited', 'ORDER_NOT_EDITED')

      editedOrder = order
    })

    if (!editedOrder)
      throw new HttpError(400, 'Order not edited', 'ORDER_NOT_EDITED')

    await AutomationService.run({
      type: 'order-updated',
      entityId: editedOrder.id,
      user,
    })

    return {
      status: 'success',
      code: 'ORDER_EDITED',
      message: 'Order edited',
      order: editedOrder,
    }
  }
  finally {
    await session.endSession()
  }
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
  const margins = 30
  const params = {
    size: [210 * mm, 297 * mm],
    margins: {
      top: 50,
      bottom: 50,
      left: 30,
      right: 30,
    },
  }

  const { propertyIds, hairTypes, invoicePrefix, invoiceAddition } = getHardcodeData()

  const contentWidth = params.size[0] - margins * 2
  // const contentHeight = size.h - padding * 2

  const tableColumns = {
    name: { key: 'name', width: 100, x: margins, align: 'left', type: 'text' },
    length: { key: 'length', width: 50, x: margins + 100, align: 'left', type: 'text' },
    weight: { key: 'weight', width: 50, x: margins + 150, align: 'left', type: 'text' },
    type: { key: 'type', width: 80, x: margins + 200, align: 'left', type: 'text' },
    price: { key: 'price', width: 60, x: margins + 280, align: 'left', type: 'text' },
    segment: { key: 'segment', width: 60, x: margins + 340, align: 'left', type: 'text' },
    discount: { key: 'discount', width: 50, x: margins + 400, align: 'left', type: 'text' },
    // total: { key: 'total', width: 100, x: params.size[0] - margins - 100, align: 'right', type: 'text' },
    total: { key: 'total', width: 100, x: params.size[0] - margins - 100, align: 'right', type: 'text' },
  }

  const order = await OrderModel.findOne({ seq }).populate('client') as unknown as Order & { client: Client }

  if (!order) {
    throw new HttpError(400, 'Order not found', 'ORDER_NOT_FOUND')
  }

  const { orderItems } = await getItems({ filters: { order: [order.id] }, pagination: { full: true } }) as any

  const hasDiscount = orderItems.some((item: any) => item.discountAmount > 0 || item.discountPercent > 0)

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
      {
        ...tableColumns.name,
        value: 'Name',
      },
      {
        ...tableColumns.length,
        value: 'Length',
      },
      {
        ...tableColumns.weight,
        value: 'Weight',
      },
      {
        ...tableColumns.type,
        value: 'Type',
      },
      {
        ...tableColumns.price,
        value: 'Price',
      },
      {
        ...tableColumns.segment,
        value: 'Segment',
      },
      ...(hasDiscount
        ? [
            {
              ...tableColumns.discount,
              value: 'Discount',
            },
          ]
        : []),
      {
        ...tableColumns.total,
        value: 'Total',
      },
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
  // doc.image(
  //   path.resolve(__dirname, '../utils/invoice/logo.png'),
  //   margins,
  //   doc.y,
  //   { width: 141.67, height: 50 },
  // )
  // doc.text(
  //   `${invoicePrefix}${order.seq + invoiceAddition}`,
  //   margins,
  //   doc.y,
  //   { width: contentWidth, height: 25, align: 'right', ellipsis: true, lineBreak: false },
  // )

  // drawHr(doc, 8, 8)

  // CLIENT

  // if (order.client) {
  //   doc.fontSize(12)
  //   doc.font('Manrope-Bold')
  //   doc.text(
  //     'Client:',
  //     margins,
  //     doc.y,
  //     { width: contentWidth, height: 25, align: 'left', ellipsis: true, lineBreak: false },
  //   )

  //   doc.fontSize(10)
  //   doc.font('Manrope')
  //   if (order.client.name || order.client.lastName || order.client.middleName) {
  //     doc.text(
  //       `${order.client.name || ''} ${order.client.lastName || ''} ${order.client.middleName || ''}`,
  //       margins,
  //       doc.y,
  //       { width: contentWidth, height: 25, align: 'left', ellipsis: true, lineBreak: false },
  //     )
  //   }

  //   if (order.client.phones.length > 0) {
  //     doc.text(
  //       `${order.client.phones.join(', ')}`,
  //       margins,
  //       doc.y,
  //       { width: contentWidth, height: 25, align: 'left', ellipsis: true, lineBreak: false },
  //     )
  //   }

  //   if (order.client.emails.length > 0) {
  //     doc.text(
  //       `${order.client.emails.join(', ')}`,
  //       margins,
  //       doc.y,
  //       { width: contentWidth, height: 25, align: 'left', ellipsis: true, lineBreak: false },
  //     )
  //   }

  //   drawHr(doc, 8, 8)
  // }

  // CLIENT

  // INVOICE DATE

  // const fmt = new Intl.DateTimeFormat('ru-RU', {
  //   year: 'numeric',
  //   month: '2-digit',
  //   day: '2-digit',
  // })

  doc.fontSize(12)
  doc.font('Manrope-Bold')
  // doc.text(
  //   'Invoice date:',
  //   margins,
  //   doc.y,
  // )
  doc.fontSize(10)
  doc.font('Manrope')
  // doc.text(
  //   `${fmt.format(order.createdAt)}`,
  //   margins,
  //   doc.y,
  // )
  doc.font('Manrope-Bold')

  drawHr(doc, 8, 8)

  // INVOICE DATE

  // PRODUCTS

  function getProductPrice(lengthCm: number, type: any[]): number | null {
    let table = [
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
      { min: 100, max: 104, price: 1800 },
      { min: 105, max: 109, price: 1900 },
      { min: 110, max: 114, price: 2000 },
    ]

    let multiply = 1

    if (type.includes(hairTypes.CURLY)) {
      multiply = 1.3
    }

    if (type.includes(hairTypes.VIRGIN)) {
      table = [
        { min: 40, max: 44, price: 1800 },
        { min: 45, max: 49, price: 1900 },
        { min: 50, max: 54, price: 2000 },
        { min: 55, max: 59, price: 2100 },
        { min: 60, max: 64, price: 2200 },
        { min: 65, max: 69, price: 2300 },
        { min: 70, max: 74, price: 2400 },
        { min: 75, max: 79, price: 2500 },
        { min: 80, max: 84, price: 2600 },
        { min: 85, max: 89, price: 2700 },
        { min: 90, max: 94, price: 2800 },
        { min: 95, max: 99, price: 2900 },
        { min: 100, max: 104, price: 3000 },
        { min: 105, max: 109, price: 3100 },
        { min: 110, max: 114, price: 3200 },
      ]
    }

    if (type.includes(hairTypes.SLAVIC)) {
      table = [
        { min: 40, max: 44, price: 3600 },
        { min: 45, max: 49, price: 3700 },
        { min: 50, max: 54, price: 4800 },
        { min: 55, max: 59, price: 4900 },
        { min: 60, max: 64, price: 4000 },
        { min: 65, max: 69, price: 4100 },
        { min: 70, max: 74, price: 4200 },
        { min: 75, max: 79, price: 4300 },
        { min: 80, max: 84, price: 4400 },
        { min: 85, max: 89, price: 4500 },
        { min: 90, max: 94, price: 4600 },
        { min: 95, max: 99, price: 4700 },
        { min: 100, max: 104, price: 4800 },
        { min: 105, max: 109, price: 4900 },
        { min: 110, max: 114, price: 5000 },
      ]
    }

    if (type.includes(hairTypes.SILKY) || type.includes(hairTypes.BROWN)) {
      table = [
        { min: 40, max: 44, price: 1300 },
        { min: 45, max: 49, price: 1400 },
        { min: 50, max: 54, price: 1500 },
        { min: 55, max: 59, price: 1600 },
        { min: 60, max: 64, price: 1700 },
        { min: 65, max: 69, price: 1800 },
        { min: 70, max: 74, price: 1900 },
        { min: 75, max: 79, price: 2000 },
        { min: 80, max: 84, price: 2100 },
        { min: 85, max: 89, price: 2200 },
        { min: 90, max: 94, price: 2300 },
        { min: 95, max: 99, price: 2400 },
        { min: 100, max: 104, price: 2500 },
      ]
    }

    for (const row of table) {
      if (lengthCm >= row.min && lengthCm <= row.max) {
        return row.price * multiply
      }
    }
    return null
  }

  // function getNewProductPrice(weightGrams: number, packPrice: number) {
  //   return Math.round((packPrice * 1000) / weightGrams)
  // }

  const products = orderItems.map((item: any) => {
    const type = item.product.productProperties.find((property: any) => property.id === propertyIds.HAIR_TYPE)
    const segment = item.product.productProperties.find((property: any) => property.id === propertyIds.SEGMENT)?.value
    const colorCategory = item.product.productProperties.find((property: any) => property.id === propertyIds.COLOR_CATEGORY)?.value
    const weight = item.product.productProperties.find((property: any) => property.id === propertyIds.WEIGHT)?.value // 7c3e2c1b-f2bf-4639-baf2-7b1101fa7bf2
    const length = item.product.productProperties.find((property: any) => property.id === propertyIds.LENGTH)?.value // efcc3c51-a146-4975-bc5b-196745f76891
    const discount = item.discountAmount > 0 ? item.discountAmount * item.quantity : item.discountPercent > 0 ? item.discountPercent : 0
    const discountType = item.discountAmount > 0 ? 'amount' : item.discountPercent > 0 ? 'percent' : 'none'

    return {
      name: item.product.names[language],
      length: length || 0,
      weight: weight || 0,
      type: [...(type?.optionData || []), colorCategory].map((option: any) => option.names[language]).join(', ') || '',
      price: getProductPrice(length || 0, type?.optionData.map((option: any) => option.id) || []),
      segment: segment || '',
      total: item.price,
      currency: item.currency,
      discount,
      discountType,
    }
  }).sort((a: any, b: any) => a.length - b.length)

  doc.fontSize(10)

  renderTableHeader(doc)

  const totals = { count: 0, weight: 0, amount: {} } as any
  for (const product of products) {
    doc.font('Manrope')
    doc.fontSize(10)
    const row = [
      {
        ...tableColumns.name,
        value: product.name,
      },
      {
        ...tableColumns.length,
        value: `${product.length} cm`,
      },
      {
        ...tableColumns.weight,
        value: `${product.weight} g`,
      },
      {
        ...tableColumns.type,
        value: `${product.type}`,
      },
      {
        ...tableColumns.price,
        value: `${product.price}`,
      },
      {
        ...tableColumns.segment,
        value: `${product.segment}`,
      },
      ...(hasDiscount
        ? [
            {
              ...tableColumns.discount,
              value: `${product.discount} ${product.discountType === 'amount' ? '' : '%'}`,
            },
          ]
        : []),
      {
        ...tableColumns.total,
        value: `${product.total.toFixed(0)}`,
      },
    ]

    const rowH = measureRowHeight(doc, row, { imgMaxH: 70, minH: 22 })
    const hrH = 12
    const need = rowH + hrH

    ensureSpace(doc, need, () => renderTableHeader(doc))

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
      ...tableColumns.name,
      value: '',
    },
    {
      ...tableColumns.length,
      value: '',
    },
    {
      ...tableColumns.weight,
      value: `${totals.weight} g`,
    },
    {
      ...tableColumns.type,
      value: '',
    },
    {
      ...tableColumns.price,
      value: ``,
    },
    {
      ...tableColumns.segment,
      value: ``,
    },
    ...(hasDiscount
      ? [
          {
            ...tableColumns.discount,
            value: '',
          },
        ]
      : []),
    {
      ...tableColumns.total,
      value: Object.values(totals.amount).map((amount: any) => `${amount.total.toFixed(0)}`).join(', '),
    },
  ]

  doc.font('Manrope-Bold')
  drawTableRow(doc, totalRow)

  return { status: 'success', code: 'INVOICE_PRINTED', message: 'Invoice printed', doc }
}

export async function printDraftInvoice(payload: OrderTypes.printDraftInvoiceOrderParams): Promise<OrderTypes.printDraftInvoiceOrderResult> {
  const { products, client, language } = payload
  const mm = 2.83464567
  const margins = 30
  const params = {
    size: [210 * mm, 297 * mm],
    margins: {
      top: 50,
      bottom: 50,
      left: 30,
      right: 30,
    },
  }

  const { propertyIds } = getHardcodeData()

  const contentWidth = params.size[0] - margins * 2

  const tableColumns = {
    name: { key: 'name', width: 100, x: margins, align: 'left', type: 'text' },
    length: { key: 'length', width: 50, x: margins + 100, align: 'left', type: 'text' },
    weight: { key: 'weight', width: 50, x: margins + 150, align: 'left', type: 'text' },
    type: { key: 'type', width: 80, x: margins + 200, align: 'left', type: 'text' },
    price: { key: 'price', width: 60, x: margins + 280, align: 'left', type: 'text' },
    segment: { key: 'segment', width: 60, x: margins + 340, align: 'left', type: 'text' },
    discount: { key: 'discount', width: 50, x: margins + 400, align: 'left', type: 'text' },
    // total: { key: 'total', width: 100, x: params.size[0] - margins - 100, align: 'right', type: 'text' },
    total: { key: 'total', width: 100, x: params.size[0] - margins - 100, align: 'right', type: 'text' },
  }

  const hasDiscount = products.some((item: any) => item.discountAmount > 0 || item.discountPercent > 0)

  if (!products) {
    throw new HttpError(400, 'Products not found', 'PRODUCTS_NOT_FOUND')
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
      {
        ...tableColumns.name,
        value: 'Name',
      },
      {
        ...tableColumns.length,
        value: 'Length',
      },
      {
        ...tableColumns.weight,
        value: 'Weight',
      },
      {
        ...tableColumns.type,
        value: 'Type',
      },
      {
        ...tableColumns.price,
        value: 'Per kg',
      },
      {
        ...tableColumns.segment,
        value: 'Segment',
      },
      ...(hasDiscount
        ? [
            {
              ...tableColumns.discount,
              value: 'Discount',
            },
          ]
        : []),
      {
        ...tableColumns.total,
        value: 'Total',
      },
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
  // doc.image(
  //   path.resolve(__dirname, '../utils/invoice/logo.png'),
  //   margins,
  //   doc.y,
  //   { width: 141.67, height: 50 },
  // )
  doc.text(
    `Draft`,
    margins,
    doc.y,
    { width: contentWidth, height: 25, align: 'right', ellipsis: true, lineBreak: false },
  )

  // drawHr(doc, 8, 8)

  // CLIENT

  // if (client) {
  //   doc.fontSize(12)
  //   doc.font('Manrope-Bold')
  //   doc.text(
  //     'Client:',
  //     margins,
  //     doc.y,
  //     { width: contentWidth, height: 25, align: 'left', ellipsis: true, lineBreak: false },
  //   )

  //   doc.fontSize(10)
  //   doc.font('Manrope')
  //   if (client.name || client.lastName || client.middleName) {
  //     doc.text(
  //       `${client.name || ''} ${client.lastName || ''} ${client.middleName || ''}`,
  //       margins,
  //       doc.y,
  //       { width: contentWidth, height: 25, align: 'left', ellipsis: true, lineBreak: false },
  //     )
  //   }

  //   if (client.phones.length > 0) {
  //     doc.text(
  //       `${client.phones.join(', ')}`,
  //       margins,
  //       doc.y,
  //       { width: contentWidth, height: 25, align: 'left', ellipsis: true, lineBreak: false },
  //     )
  //   }

  //   if (client.emails.length > 0) {
  //     doc.text(
  //       `${client.emails.join(', ')}`,
  //       margins,
  //       doc.y,
  //       { width: contentWidth, height: 25, align: 'left', ellipsis: true, lineBreak: false },
  //     )
  //   }

  //   drawHr(doc, 8, 8)
  // }

  // CLIENT

  // INVOICE DATE

  // const fmt = new Intl.DateTimeFormat('ru-RU', {
  //   year: 'numeric',
  //   month: '2-digit',
  //   day: '2-digit',
  // })

  doc.fontSize(12)
  doc.font('Manrope-Bold')
  // doc.text(
  //   'Invoice date:',
  //   margins,
  //   doc.y,
  // )
  doc.fontSize(10)
  doc.font('Manrope')
  // doc.text(
  //   `${fmt.format(new Date())}`,
  //   margins,
  //   doc.y,
  // )
  doc.font('Manrope-Bold')

  drawHr(doc, 8, 8)

  // INVOICE DATE

  // PRODUCTS

  // const { orderItems } = await getItems({ filters: { order: [order.id] }, pagination: { full: true } }) as any

  // function getProductPrice(lengthCm: number, type: any[]): number | null {
  //   let table = [
  //     { min: 40, max: 44, price: 900 },
  //     { min: 45, max: 49, price: 950 },
  //     { min: 50, max: 54, price: 1000 },
  //     { min: 55, max: 59, price: 1150 },
  //     { min: 60, max: 64, price: 1200 },
  //     { min: 65, max: 69, price: 1250 },
  //     { min: 70, max: 74, price: 1300 },
  //     { min: 75, max: 79, price: 1350 },
  //     { min: 80, max: 84, price: 1400 },
  //     { min: 85, max: 89, price: 1500 },
  //     { min: 90, max: 94, price: 1600 },
  //     { min: 95, max: 99, price: 1700 },
  //     { min: 100, max: 104, price: 1800 },
  //   ]

  //   let multiply = 1

  //   if (type.includes('822ec142-d144-44fb-ba96-582cff8757b3')) {
  //     multiply = 1.3
  //   }

  //   if (type.includes('b930fb75-61a6-41c0-88de-0c69082b7f06')) {
  //     table = [
  //       { min: 40, max: 44, price: 1800 },
  //       { min: 45, max: 49, price: 1900 },
  //       { min: 50, max: 54, price: 2000 },
  //       { min: 55, max: 59, price: 2100 },
  //       { min: 60, max: 64, price: 2200 },
  //       { min: 65, max: 69, price: 2300 },
  //       { min: 70, max: 74, price: 2400 },
  //       { min: 75, max: 79, price: 2500 },
  //       { min: 80, max: 84, price: 2600 },
  //       { min: 85, max: 89, price: 2700 },
  //       { min: 90, max: 94, price: 2800 },
  //       { min: 95, max: 99, price: 2900 },
  //       { min: 100, max: 104, price: 3000 },
  //     ]
  //   }

  //   if (type.includes('aeb36d06-1a12-4319-9313-51abcbed38fb') || type.includes('44307e30-0fb8-4ab1-af56-6d8d724dd204')) {
  //     table = [
  //       { min: 40, max: 44, price: 1300 },
  //       { min: 45, max: 49, price: 1400 },
  //       { min: 50, max: 54, price: 1500 },
  //       { min: 55, max: 59, price: 1600 },
  //       { min: 60, max: 64, price: 1700 },
  //       { min: 65, max: 69, price: 1800 },
  //       { min: 70, max: 74, price: 1900 },
  //       { min: 75, max: 79, price: 2000 },
  //       { min: 80, max: 84, price: 2100 },
  //       { min: 85, max: 89, price: 2200 },
  //       { min: 90, max: 94, price: 2300 },
  //       { min: 95, max: 99, price: 2400 },
  //       { min: 100, max: 104, price: 2500 },
  //     ]
  //   }

  //   for (const row of table) {
  //     if (lengthCm >= row.min && lengthCm <= row.max) {
  //       return row.price * multiply
  //     }
  //   }
  //   return null
  // }

  function getNewProductPrice(weightGrams: number, packPrice: number) {
    return Math.round((packPrice * 1000) / weightGrams)
  }

  const productsData = products.map((item: any) => {
    const type = item.productProperties.find((property: any) => property.id === propertyIds.HAIR_TYPE)
    const colorCategory = item.productProperties.find((property: any) => property.id === propertyIds.COLOR_CATEGORY)?.value
    const weight = item.productProperties.find((property: any) => property.id === propertyIds.WEIGHT)?.value
    const length = item.productProperties.find((property: any) => property.id === propertyIds.LENGTH)?.value
    const segment = item.productProperties.find((property: any) => property.id === propertyIds.SEGMENT)?.value
    const discount = item.discountAmount > 0 ? item.discountAmount : item.discountPercent > 0 ? item.discountPercent : 0
    const discountType = item.discountAmount > 0 ? 'amount' : item.discountPercent > 0 ? 'percent' : 'none'

    return {
      name: `#${item.names[language].split('#')[1] || ''}`,
      length: length || 0,
      weight: weight || 0,
      type: [...(type?.optionData || []), colorCategory].map((option: any) => option.names[language]).join(', ') || '',
      price: getNewProductPrice(weight || 0, item.price),
      segment: segment || '',
      total: item.price,
      currency: item.currency,
      discount,
      discountType,
    }
  }).sort((a: any, b: any) => a.length - b.length)

  doc.fontSize(10)

  renderTableHeader(doc)

  const totals = { count: 0, weight: 0, amount: {} } as any
  for (const product of productsData) {
    doc.font('Manrope')
    doc.fontSize(10)
    const row = [
      {
        ...tableColumns.name,
        value: product.name,
      },
      {
        ...tableColumns.length,
        value: `${product.length} cm`,
      },
      {
        ...tableColumns.weight,
        value: `${product.weight} g`,
      },
      {
        ...tableColumns.type,
        value: `${product.type}`,
      },
      {
        ...tableColumns.price,
        value: `${product.price}`,
      },
      {
        ...tableColumns.segment,
        value: `${product.segment}`,
      },
      ...(hasDiscount
        ? [
            {
              ...tableColumns.discount,
              value: `${product.discount} ${product.discountType === 'amount' ? '' : '%'}`,
            },
          ]
        : []),
      {
        ...tableColumns.total,
        value: `${product.total}`,
      },
    ]

    const rowH = measureRowHeight(doc, row, { imgMaxH: 70, minH: 22 })
    const hrH = 12
    const need = rowH + hrH

    ensureSpace(doc, need, () => renderTableHeader(doc))

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
      ...tableColumns.name,
      value: '',
    },
    {
      ...tableColumns.length,
      value: '',
    },
    {
      ...tableColumns.weight,
      value: `${totals.weight} g`,
    },
    {
      ...tableColumns.type,
      value: '',
    },
    {
      ...tableColumns.price,
      value: ``,
    },
    {
      ...tableColumns.segment,
      value: ``,
    },
    ...(hasDiscount
      ? [
          {
            ...tableColumns.discount,
            value: '',
          },
        ]
      : []),
    {
      ...tableColumns.total,
      value: Object.values(totals.amount).map((amount: any) => `${amount.total.toFixed(2)}`).join(', '),
    },
  ]

  doc.font('Manrope-Bold')
  drawTableRow(doc, totalRow)

  return { status: 'success', code: 'DRAFT_INVOICE_PRINTED', message: 'Draft invoice printed', doc }
}

export async function printOrderLabel(payload: OrderTypes.printOrderLabelParams): Promise<OrderTypes.printOrderLabelResult> {
  const { seq } = payload

  const orders = await get({ filters: { seq: seq.toString() } })

  const order = orders.orders[0]
  const client = order.client as any

  if (!order || !client) {
    throw new HttpError(400, 'Order or client not found', 'ORDER_OR_CLIENT_NOT_FOUND')
  }

  const MM = 8.49
  const [wMm, hMm] = [55, 40]
  const paddingMm = 1.5

  const size: [number, number] = [wMm * MM, hMm * MM]
  const margins = {
    top: paddingMm * MM,
    left: paddingMm * MM,
    right: paddingMm * MM,
    bottom: paddingMm * MM,
  }

  const { invoiceAddition } = getHardcodeData()

  const doc = new PDFDocument({ autoFirstPage: false })

  doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
  doc.registerFont('Manrope-Bold', path.resolve(__dirname, '../utils/fonts/Manrope-ExtraBold.ttf'))

  doc.addPage({ size, margins })

  if (order) {
    doc.font('Manrope-Bold')
    doc.fontSize(70)
    doc.text(
      `#${order.seq + invoiceAddition}`,
      margins.left,
      doc.y - 15,
      { width: size[0] - margins.left - margins.right, height: 25, align: 'left' },
    )
  }

  if (client) {
    doc.y -= 15
    doc.font('Manrope-Bold')
    doc.fontSize(28)
    doc.text(
      `${client?.name || ''} ${client?.lastName || ''} ${client?.middleName || ''}`,
      margins.left,
      doc.y,
      { width: size[0] - margins.left - margins.right, height: 25, align: 'left' },
    )
    doc.text(
      `${client?.phones?.join(', ') || ''}`,
      margins.left,
      doc.y,
      { width: size[0] - margins.left - margins.right, height: 25, align: 'left' },
    )
    doc.text(
      `${client?.emails?.join(', ') || ''}`,
      margins.left,
      doc.y,
      { width: size[0] - margins.left - margins.right, height: 25, align: 'left' },
    )
  }

  drawHr(doc, margins, size)

  doc.text(
    `${order.comment || ''}`,
    margins.left,
    doc.y,
    { width: size[0] - margins.left - margins.right, align: 'left' },
  )

  return { status: 'success', code: 'ORDER_LABEL_PRINTED', message: 'Order label printed', doc }
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
  // let sellingPrice = item.price

  // if (item.discountPercent && item.discountPercent > 0) {
  //   sellingPrice -= (sellingPrice * item.discountPercent) / 100
  // }
  // else if (item.discountAmount && item.discountAmount > 0) {
  //   sellingPrice -= item.discountAmount
  // }

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

  const profit = item.price - convertedPurchasePrice
  // const profit = unitProfit * item.quantity

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

async function applyItemsDiff(params: {
  orderId: string
  warehouseId: string
  items: (OrderTypes.OrderItem & { basePrice: number, manualPrice: number, discountAmount: number, discountPercent: number })[]
  userId: string
  session: ClientSession
}) {
  const { orderId, warehouseId, items, userId, session } = params

  const order = await OrderModel.findOne(
    { _id: orderId },
    { warehouse: 1 },
    { session },
  )

  if (!order) {
    throw new HttpError(400, 'Order not found', 'ORDER_NOT_FOUND')
  }

  const prevWarehouseId = order.warehouse.toString()
  const newWarehouseId = warehouseId.toString()
  const warehouseChanged = prevWarehouseId !== newWarehouseId

  const oldItems = await OrderItemModel.find(
    { order: orderId, removed: false },
    null,
    { session },
  ).lean()

  const oldById = new Map<string, any>(
    oldItems.map(i => [i._id.toString(), i]),
  )

  for (const newItem of items) {
    if (newItem.id && oldById.has(newItem.id)) {
      const oldItem = oldById.get(newItem.id)!

      const oldQty = oldItem.quantity
      const newQty = newItem.quantity
      const deltaQty = newQty - oldQty

      if (!warehouseChanged) {
        if (deltaQty !== 0) {
          await QuantityService.count(
            {
              product: newItem.product,
              count: -deltaQty,
              warehouse: newWarehouseId,
              userId,
              refType: 'order',
              refId: orderId,
            },
            session,
          )
        }
      }
      else {
        await QuantityService.count(
          {
            product: oldItem.product,
            count: oldQty,
            warehouse: prevWarehouseId,
            userId,
            refType: 'order',
            refId: orderId,
          },
          session,
        )

        await QuantityService.count(
          {
            product: newItem.product,
            count: -newQty,
            warehouse: newWarehouseId,
            userId,
            refType: 'order',
            refId: orderId,
          },
          session,
        )
      }

      const product = await ProductModel.findOne(
        { _id: newItem.product },
        null,
        { session },
      )

      if (!product)
        throw new HttpError(400, 'Product not found', 'PRODUCT_NOT_FOUND')

      const { profit, exchangeRate } = await calculateProfit({
        item: newItem,
        purchasePrice: product.purchasePrice,
        purchaseCurrency: product.purchaseCurrency,
      })

      const oldItemObj = { ...oldItem }
      const newItemObj = {
        ...oldItemObj,
        product: newItem.product,
        quantity: newItem.quantity,
        basePrice: newItem.basePrice,
        manualPrice: newItem.manualPrice,
        discountAmount: newItem.discountAmount,
        discountPercent: newItem.discountPercent,
        price: newItem.price,
        currency: newItem.currency,
        purchasePrice: product.purchasePrice,
        purchaseCurrency: product.purchaseCurrency,
        profit,
        exchangeRate,
      }

      const diff = getDifferenceDeep(oldItemObj, newItemObj)

      delete diff._id
      delete diff.order
      delete diff.createdBy

      if (Object.keys(diff).length > 0) {
        await OrderItemModel.updateOne(
          { _id: oldItem._id },
          { $set: diff },
          { session },
        )
      }

      oldById.delete(newItem.id)
    }
    else {
      const product = await ProductModel.findOne(
        { _id: newItem.product },
        null,
        { session },
      )

      if (!product)
        throw new HttpError(400, 'Product not found', 'PRODUCT_NOT_FOUND')

      const { profit, exchangeRate } = await calculateProfit({
        item: newItem,
        purchasePrice: product.purchasePrice,
        purchaseCurrency: product.purchaseCurrency,
      })

      await OrderItemModel.create(
        [{
          ...newItem,
          order: orderId,
          purchasePrice: product.purchasePrice,
          purchaseCurrency: product.purchaseCurrency,
          profit,
          exchangeRate,
          createdBy: userId,
        }],
        { session },
      )

      await QuantityService.count(
        {
          product: newItem.product,
          count: -newItem.quantity,
          warehouse: newWarehouseId,
          userId,
          refType: 'order',
          refId: orderId,
        },
        session,
      )
    }
  }

  for (const [, oldItem] of oldById) {
    await OrderItemModel.updateOne(
      { _id: oldItem._id },
      {
        $set: {
          removed: true,
          removedBy: userId,
        },
      },
      { session },
    )

    await QuantityService.count(
      {
        product: oldItem.product,
        count: oldItem.quantity,
        warehouse: prevWarehouseId,
        userId,
        refType: 'order',
        refId: orderId,
      },
      session,
    )
  }
}

async function applyPaymentsDiff(params: {
  orderId: string
  payments: OrderPaymentTypes.OrderPayment[]
  userId: string
  session: ClientSession
}): Promise<string[]> {
  const { orderId, payments, userId, session } = params

  const oldPayments = await OrderPaymentModel.find(
    { order: orderId, removed: false },
    null,
    { session },
  )

  const oldById = new Map<string, any>(
    oldPayments.map(p => [p.id.toString(), p]),
  )

  const activePaymentIds: string[] = []

  for (const payment of payments) {
    if (payment.id && oldById.has(payment.id)) {
      const oldPayment = oldById.get(payment.id)!

      const amountChanged = payment.amount !== oldPayment.amount
      const currencyChanged = payment.currency.toString() !== oldPayment.currency.toString()
      const accountChanged = payment.cashregisterAccount.toString() !== oldPayment.cashregisterAccount.toString()
      const cashregisterChanged = payment.cashregister.toString() !== oldPayment.cashregister.toString()

      // Если что-то важное изменилось — отменяем старый, создаём новый
      if (amountChanged || currencyChanged || accountChanged || cashregisterChanged) {
        // 1) отменяем старый платёж
        await OrderPaymentModel.updateOne(
          { _id: oldPayment.id },
          {
            $set: {
              removed: true,
              removedBy: userId,
              paymentStatus: 'cancelled',
            },
          },
          { session },
        )

        await MoneyTransactionService.create(
          {
            type: 'income',
            direction: 'out',
            account: oldPayment.cashregisterAccount,
            cashregister: oldPayment.cashregister,
            sourceModel: 'order',
            sourceId: orderId,
            currency: oldPayment.currency,
            amount: oldPayment.amount,
            description: `Cancelled payment for order ${orderId}`,
          },
          session,
        )

        // 2) создаём новый
        const createdPaymentArr = await OrderPaymentModel.create(
          [{
            ...payment,
            order: orderId,
            createdBy: userId,
            paymentStatus: 'paid',
          }],
          { session },
        )

        const createdPayment = createdPaymentArr[0]
        activePaymentIds.push(createdPayment.id.toString())

        await MoneyTransactionService.create(
          {
            type: 'income',
            direction: 'in',
            account: payment.cashregisterAccount,
            cashregister: payment.cashregister,
            sourceModel: 'order',
            sourceId: orderId,
            currency: payment.currency,
            amount: payment.amount,
            description: `Payment for order ${orderId}`,
          },
          session,
        )
      }
      else {
        // Ничего важного не изменилось — оставляем старый платёж как есть
        activePaymentIds.push(oldPayment.id.toString())
      }

      oldById.delete(payment.id)
    }
    else {
      // Новый платёж
      const createdPaymentArr = await OrderPaymentModel.create(
        [{
          ...payment,
          order: orderId,
          createdBy: userId,
          paymentStatus: 'paid',
        }],
        { session },
      )

      const createdPayment = createdPaymentArr[0]
      activePaymentIds.push(createdPayment.id.toString())

      await MoneyTransactionService.create(
        {
          type: 'income',
          direction: 'in',
          account: payment.cashregisterAccount,
          cashregister: payment.cashregister,
          sourceModel: 'order',
          sourceId: orderId,
          currency: payment.currency,
          amount: payment.amount,
          description: `Payment for order ${orderId}`,
        },
        session,
      )
    }
  }

  // Всё, что осталось в oldById — удалённые платежи
  for (const [, oldPayment] of oldById) {
    await OrderPaymentModel.updateOne(
      { _id: oldPayment.id },
      {
        $set: {
          removed: true,
          removedBy: userId,
          paymentStatus: 'cancelled',
        },
      },
      { session },
    )

    await MoneyTransactionService.create(
      {
        type: 'income',
        direction: 'out',
        account: oldPayment.cashregisterAccount,
        cashregister: oldPayment.cashregister,
        sourceModel: 'order',
        sourceId: orderId,
        currency: oldPayment.currency,
        amount: oldPayment.amount,
        description: `Cancelled payment for order ${orderId}`,
      },
      session,
    )
  }

  return activePaymentIds
}
