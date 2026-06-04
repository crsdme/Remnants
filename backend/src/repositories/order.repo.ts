import type { AggregateResult, OrderDTO, OrderItemDTO, OrderPaymentDTO } from '@remnant/shared'
import type { ClientSession, PipelineStage } from 'mongoose'
import type {
  CreateOrderItemRepoPayload,
  CreateOrderRepoPayload,
  EditOrderItemRepoPayload,
  EditOrderRepoPayload,
  FindOneOrderRepoPayload,
  GetOrderItemsRepoPayload,
  GetOrderItemsRepoResult,
  GetOrderPaymentsRepoPayload,
  GetOrderPaymentsRepoResult,
  GetOrdersRepoPayload,
  GetOrdersRepoResult,
  OrderDBPopulated,
} from '@/types'
import { OrderItemModel, OrderModel, OrderPaymentModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list({ payload, session }: { payload: GetOrdersRepoPayload, session?: ClientSession }): Promise<GetOrdersRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    ids,
    seq,
    warehouse,
    deliveryService,
    orderSource,
    orderStatus,
    orderPayments,
    client,
    comment,
    createdBy,
    confirmedBy,
    removedBy,
    createdAt,
    updatedAt,
    hasProfitPermission,
    removed,
  } = payload.filters

  let orderStatusQuery = orderStatus
  if (orderStatus.includes('all'))
    orderStatusQuery = []

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
    rules: {
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
    },
  })

  const sorters = buildSortQuery(payload.sorters, { seq: -1 })

  const profitStages: PipelineStage[] = []

  if (hasProfitPermission === true) {
    profitStages.push(
      {
        $lookup: {
          from: 'order-items',
          let: { oid: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$order', '$$oid'] }, { $ne: ['$removed', true] }] } } },
            {
              $addFields: {
                curKey: { $ifNull: ['$currency.id', { $ifNull: ['$currency._id', '$currency'] }] },
                lineTotal: {
                  $multiply: [
                    { $toDouble: { $ifNull: ['$profit', 0] } },
                    { $toDouble: { $ifNull: ['$quantity', 0] } },
                  ],
                },
              },
            },
            {
              $group: {
                _id: '$curKey',
                currency: { $last: '$currency' },
                total: { $sum: '$lineTotal' },
              },
            },
            { $project: { _id: 0, currency: 1, total: 1 } },
          ],
          as: 'profit',
        },
      },
    )
  }

  const pipeline: PipelineStage[] = [
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
          {
            $addFields: {
              curKey: { $ifNull: ['$currency.id', { $ifNull: ['$currency._id', '$currency'] }] },
              lineTotal: {
                $multiply: [
                  { $toDouble: { $ifNull: ['$price', 0] } },
                  { $toDouble: { $ifNull: ['$quantity', 0] } },
                ],
              },
            },
          },
          {
            $group: {
              _id: '$curKey',
              currency: { $last: '$currency' },
              total: { $sum: '$lineTotal' },
            },
          },
          { $project: { _id: 0, currency: 1, total: 1 } },
        ],
        as: 'totals',
      },
    },
    ...profitStages,
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
        items: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        count: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await OrderModel.aggregate<AggregateResult<OrderDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function listItems({ payload, session }: { payload: GetOrderItemsRepoPayload, session?: ClientSession }): Promise<GetOrderItemsRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    order,
    showFullData,
  } = payload.filters

  const query = buildQuery({
    filters: {
      order,
    },
    rules: {
      order: { type: 'array' },
    },
  })

  const sorters = buildSortQuery(payload.sorters, { seq: -1 })

  const projection: Record<string, unknown> = {
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
    projection.profit = 1
    projection.exchangeRate = 1
    projection.purchasePrice = 1
    projection.purchaseCurrency = { id: '$purchaseCurrency._id', names: 1, symbols: 1 }
  }

  const pipeline: PipelineStage[] = [
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
      $project: projection,
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
        items: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        count: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await OrderItemModel.aggregate<AggregateResult<OrderItemDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function listPayments({ payload, session }: { payload: GetOrderPaymentsRepoPayload, session?: ClientSession }): Promise<GetOrderPaymentsRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    order,
  } = payload.filters

  const query = buildQuery({
    filters: {
      order,
    },
    rules: {
      order: { type: 'array' },
    },
  })

  const sorters = buildSortQuery(payload.sorters, { seq: -1 })

  const pipeline: PipelineStage[] = [
    {
      $match: query,
    },
    {
      $sort: sorters,
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
        items: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        count: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await OrderPaymentModel.aggregate<AggregateResult<OrderPaymentDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne({ payload }: { payload: CreateOrderRepoPayload }) {
  return OrderModel.create(payload)
}

export async function createOneItem({ payload, session }: { payload: CreateOrderItemRepoPayload, session?: ClientSession }) {
  return OrderItemModel.create(payload, { session }).exec()
}

export async function updateById({ id, payload, session }: { id: string, payload: EditOrderRepoPayload, session?: ClientSession }) {
  return OrderModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true, session },
  ).exec()
}

export async function updateOneItem({ payload, session }: { payload: EditOrderItemRepoPayload, session?: ClientSession }) {
  return OrderItemModel.findOneAndUpdate(
    { _id: payload.id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true, session },
  ).exec()
}

export async function findOne({ payload, session }: { payload: FindOneOrderRepoPayload, session?: ClientSession }) {
  const { id, seq } = payload
  return OrderModel.findOne({ _id: id, seq }, { session }).populate('client', 'name lastName middleName phones emails').lean<OrderDBPopulated>().exec()
}

export async function findById(id: string) {
  return OrderModel.findById(id).exec()
}

export async function removeById(id: string) {
  return OrderModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
