import type { AggregateResult, OrderDeliveryDTO } from '@remnant/shared'
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
  OrderDB,
  OrderDBPopulated,
  OrderItemDBPopulated,
  OrderPaymentDBPopulated,
} from '@/types'
import { OrderItemModel, OrderModel, PaymentApplicationModel } from '@/models'
import { warehouseStockFromLotsAddFields, warehouseStockFromLotsLookup } from '@/repositories/stock-lot.repo'
import { applyScopeIdsToQuery, buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list({
  payload,
  options = {},
}: {
  payload: GetOrdersRepoPayload
  options?: {
    warehouseIds?: string[] | null
    deliveryServiceIds?: string[] | null
    orderSourceIds?: string[] | null
    orderStatusIds?: string[] | null
  }
}): Promise<GetOrdersRepoResult> {
  const {
    current,
    pageSize,
    full,
  } = payload.pagination

  const {
    ids,
    seq,
    warehouse,
    deliveryService,
    orderSource,
    orderStatus,
    client,
    comment,
    createdBy,
    confirmedBy,
    removedBy,
    createdAt,
    updatedAt,
    removed,
  } = payload.filters

  const query = buildQuery({
    filters: {
      _id: ids,
      seq,
      warehouse,
      deliveryService,
      orderSource,
      orderStatus,
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
      warehouse: { type: 'string', field: 'warehouseId' },
      deliveryService: { type: 'string', field: 'deliveryServiceId' },
      orderSource: { type: 'string', field: 'orderSourceId' },
      orderStatus: { type: 'array', field: 'orderStatusId' },
      client: { type: 'string', field: 'clientId' },
      comment: { type: 'string' },
      createdBy: { type: 'string' },
      removedBy: { type: 'string' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
      removed: { type: 'exact' },
    },
  })

  applyScopeIdsToQuery(query, options.warehouseIds, 'warehouseId')
  applyScopeIdsToQuery(query, options.deliveryServiceIds, 'deliveryServiceId')
  applyScopeIdsToQuery(query, options.orderSourceIds, 'orderSourceId')
  applyScopeIdsToQuery(query, options.orderStatusIds, 'orderStatusId')
  const sorters = buildSortQuery(payload.sorters, { seq: -1 })

  const profitStages: PipelineStage.FacetPipelineStage[] = []

  if (payload.hasProfitPermission === true) {
    profitStages.push(
      {
        $lookup: {
          from: 'order-items',
          let: { oid: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$orderId', '$$oid'] }, { $ne: ['$removed', true] }] } } },
            {
              $addFields: {
                curKey: { $ifNull: ['$currencyId.id', { $ifNull: ['$currencyId._id', '$currencyId'] }] },
                lineTotal: {
                  $multiply: [
                    { $toDouble: { $ifNull: ['$minorProfit', 0] } },
                    { $toDouble: { $ifNull: ['$quantity', 0] } },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'currencies',
                localField: 'currencyId',
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
              $group: {
                _id: '$curKey',
                currency: { $last: '$currency._id' },
                scale: { $last: '$currency.scale' },
                total: { $sum: '$lineTotal' },
              },
            },
            { $project: { _id: 0, currency: 1, scale: 1, total: 1 } },
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
      $facet: {
        items: [
          ...(full
            ? []
            : [
                { $skip: (current - 1) * pageSize },
                { $limit: pageSize },
              ]),
          {
            $lookup: {
              from: 'clients',
              localField: 'clientId',
              foreignField: '_id',
              as: 'client',
            },
          },
          {
            $lookup: {
              from: 'delivery-services',
              localField: 'deliveryServiceId',
              foreignField: '_id',
              as: 'deliveryService',
            },
          },
          {
            $lookup: {
              from: 'order-sources',
              localField: 'orderSourceId',
              foreignField: '_id',
              as: 'orderSource',
            },
          },
          {
            $lookup: {
              from: 'order-statuses',
              localField: 'orderStatusId',
              foreignField: '_id',
              as: 'orderStatus',
            },
          },
          {
            $lookup: {
              from: 'warehouses',
              localField: 'warehouseId',
              foreignField: '_id',
              as: 'warehouse',
            },
          },
          {
            $lookup: {
              from: 'payment-applications',
              let: { oid: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$documentId', '$$oid'] },
                        { $eq: ['$documentType', 'order'] },
                        { $ne: ['$cancelled', true] },
                      ],
                    },
                  },
                },
                {
                  $lookup: {
                    from: 'currencies',
                    localField: 'currencyId',
                    foreignField: '_id',
                    as: 'currency',
                  },
                },
                {
                  $project: {
                    _id: 0,
                    id: '$_id',
                    minorAmount: 1,
                    scale: { $ifNull: [{ $arrayElemAt: ['$currency.scale', 0] }, 2] },
                    paymentDate: '$createdAt',
                    comment: { $ifNull: ['$comment', ''] },
                  },
                },
              ],
              as: 'orderPayments',
            },
          },
          {
            $lookup: {
              from: 'order-items',
              let: { oid: '$_id' },
              pipeline: [
                { $match: { $expr: { $and: [{ $eq: ['$orderId', '$$oid'] }, { $ne: ['$removed', true] }] } } },
                {
                  $addFields: {
                    curKey: { $ifNull: ['$currencyId.id', { $ifNull: ['$currencyId._id', '$currencyId'] }] },
                    lineTotal: {
                      $multiply: [
                        { $toDouble: { $ifNull: ['$minorPrice', 0] } },
                        { $toDouble: { $ifNull: ['$quantity', 0] } },
                      ],
                    },
                  },
                },
                {
                  $lookup: {
                    from: 'currencies',
                    localField: 'currencyId',
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
                  $group: {
                    _id: '$curKey',
                    currency: { $last: '$currency._id' },
                    scale: { $last: '$currency.scale' },
                    total: { $sum: '$lineTotal' },
                  },
                },
                { $project: { _id: 0, currency: 1, scale: 1, total: 1 } },
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
              client: {
                $cond: [
                  { $ifNull: ['$client._id', false] },
                  {
                    id: '$client._id',
                    seq: '$client.seq',
                    name: '$client.name',
                    lastName: '$client.lastName',
                    middleName: '$client.middleName',
                    phones: '$client.phones',
                    emails: '$client.emails',
                  },
                  null,
                ],
              },
              deliveryService: { id: '$deliveryService._id', names: 1, type: 1, color: 1, priority: 1 },
              orderSource: { id: '$orderSource._id', names: 1, type: 1, color: 1, priority: 1 },
              orderStatus: { id: '$orderStatus._id', names: 1, type: 1, color: 1, isLocked: 1, priority: 1 },
              warehouse: { id: '$warehouse._id', names: 1, priority: 1 },
              totals: { $ifNull: ['$totals', []] },
              orderPayments: { $ifNull: ['$orderPayments', []] },
              profit: { $ifNull: ['$profit', []] },
              orderPaymentStatus: 1,
              comment: 1,
              delivery: 1,
              files: { $ifNull: ['$files', []] },
              createdAt: 1,
              updatedAt: 1,
              createdBy: 1,
              confirmedBy: 1,
              removedBy: 1,
            },
          },
        ],
        count: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await OrderModel.aggregate<AggregateResult<OrderDBPopulated>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function listItems({ payload }: { payload: GetOrderItemsRepoPayload }): Promise<GetOrderItemsRepoResult> {
  const {
    current,
    pageSize,
    full,
  } = payload.pagination

  const {
    order,
  } = payload.filters

  const query = buildQuery({
    filters: {
      order,
    },
    rules: {
      order: { type: 'array', field: 'orderId' },
      seq: { type: 'array' },
    },
  })

  const projection: Record<string, unknown> = {
    _id: 1,
    orderId: 1,
    product: 1,
    quantity: 1,
    minorManualPrice: 1,
    minorBasePrice: 1,
    currency: { id: '$currency._id', names: '$currency.names', symbols: '$currency.symbols', scale: '$currency.scale', paymentEpsilon: '$currency.paymentEpsilon' },
    purchaseCurrency: { id: '$purchaseCurrency._id', names: '$purchaseCurrency.names', symbols: '$purchaseCurrency.symbols', scale: '$purchaseCurrency.scale' },
    minorPrice: 1,
    minorDiscountAmount: 1,
    discountPercent: 1,
    exchangeRate: 1,
    removedBy: 1,
    createdBy: 1,
    removed: 1,
    createdAt: 1,
    updatedAt: 1,
  }

  const productProjection: Record<string, unknown> = {
    _id: 1,
    seq: 1,
    names: 1,
    minorPrice: 1,
    minorManualPrice: 1,
    minorBasePrice: 1,
    minorDiscountAmount: 1,
    discountPercent: 1,
    exchangeRate: 1,
    order: 1,
    currency: { id: '$currency._id', names: '$currency.names', symbols: '$currency.symbols', scale: '$currency.scale' },
    purchaseCurrency: { id: '$purchaseCurrency._id', names: '$purchaseCurrency.names', symbols: '$purchaseCurrency.symbols', scale: '$purchaseCurrency.scale' },
    barcodes: { id: 1, code: 1 },
    categories: { id: 1, names: 1 },
    unit: { id: '$unit._id', names: '$unit.names', symbols: '$unit.symbols' },
    warehouseStock: { count: 1, warehouseId: 1, status: 1 },
    images: 1,
    productProperties: { id: 1, value: 1, data: { names: 1, symbols: 1, type: 1, isRequired: 1, showInTable: 1, showInStatistics: 1 }, options: { id: 1, names: 1, color: 1 } },
    productPropertiesGroup: { id: '$productPropertiesGroup._id', names: '$productPropertiesGroup.names' },
    createdAt: 1,
    updatedAt: 1,
    removedBy: 1,
    createdBy: 1,
  }

  if (payload.hasProfitPermission === true) {
    projection.minorProfit = 1
    projection.minorPurchasePrice = 1

    productProjection.minorProfit = 1
    productProjection.minorPurchasePrice = 1
  }

  const pipeline: PipelineStage[] = [
    {
      $match: query,
    },
    {
      $facet: {
        items: [
          ...(full
            ? []
            : [
                { $skip: (current - 1) * pageSize },
                { $limit: pageSize },
              ]),
          {
            $lookup: {
              from: 'currencies',
              localField: 'currencyId',
              foreignField: '_id',
              as: 'currency',
            },
          },
          {
            $lookup: {
              from: 'products',
              let: { productId: '$productId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$productId'] } } },
                {
                  $lookup: {
                    from: 'product-properties',
                    localField: 'productProperties._id',
                    foreignField: '_id',
                    as: 'productPropertiesData',
                  },
                },
                {
                  $addFields: {
                    productPropertyOptionIds: {
                      $reduce: {
                        input: { $ifNull: ['$productProperties', []] },
                        initialValue: [],
                        in: {
                          $setUnion: [
                            '$$value',
                            {
                              $filter: {
                                input: {
                                  $cond: [
                                    { $isArray: '$$this.value' },
                                    '$$this.value',
                                    [{ $ifNull: ['$$this.value', null] }],
                                  ],
                                },
                                as: 'optionId',
                                cond: { $ne: ['$$optionId', null] },
                              },
                            },
                          ],
                        },
                      },
                    },
                  },
                },
                {
                  $lookup: {
                    from: 'product-property-options',
                    localField: 'productPropertyOptionIds',
                    foreignField: '_id',
                    as: 'productPropertyOptions',
                  },
                },
                {
                  $lookup: {
                    from: 'currencies',
                    localField: 'currencyId',
                    foreignField: '_id',
                    as: 'currency',
                  },
                },
                {
                  $lookup: {
                    from: 'currencies',
                    localField: 'purchaseCurrencyId',
                    foreignField: '_id',
                    as: 'purchaseCurrency',
                  },
                },
                {
                  $lookup: {
                    from: 'units',
                    localField: 'unitId',
                    foreignField: '_id',
                    as: 'unit',
                  },
                },
                {
                  $lookup: {
                    from: 'categories',
                    localField: 'categoryIds',
                    foreignField: '_id',
                    as: 'categories',
                  },
                },
                warehouseStockFromLotsLookup(),
                warehouseStockFromLotsAddFields(),
                {
                  $lookup: {
                    from: 'product-property-groups',
                    localField: 'productPropertiesGroupId',
                    foreignField: '_id',
                    as: 'productPropertiesGroup',
                  },
                },
                {
                  $lookup: {
                    from: 'barcodes',
                    localField: 'barcodeIds',
                    foreignField: '_id',
                    as: 'barcodes',
                  },
                },
                {
                  $addFields: {
                    currency: { $arrayElemAt: ['$currency', 0] },
                    purchaseCurrency: {
                      $ifNull: [
                        { $arrayElemAt: ['$purchaseCurrency', 0] },
                        { $arrayElemAt: ['$currency', 0] },
                      ],
                    },
                    unit: { $arrayElemAt: ['$unit', 0] },
                    productPropertiesGroup: { $arrayElemAt: ['$productPropertiesGroup', 0] },
                    productProperties: {
                      $map: {
                        input: { $ifNull: ['$productProperties', []] },
                        as: 'prop',
                        in: {
                          $let: {
                            vars: {
                              propData: {
                                $arrayElemAt: [
                                  {
                                    $filter: {
                                      input: '$productPropertiesData',
                                      as: 'data',
                                      cond: { $eq: ['$$data._id', '$$prop._id'] },
                                    },
                                  },
                                  0,
                                ],
                              },
                              propValueIds: {
                                $filter: {
                                  input: {
                                    $cond: [
                                      { $isArray: '$$prop.value' },
                                      '$$prop.value',
                                      [{ $ifNull: ['$$prop.value', null] }],
                                    ],
                                  },
                                  as: 'valueId',
                                  cond: { $ne: ['$$valueId', null] },
                                },
                              },
                            },
                            in: {
                              id: '$$prop._id',
                              value: '$$prop.value',
                              data: {
                                names: '$$propData.names',
                                symbols: '$$propData.symbols',
                                type: '$$propData.type',
                                isRequired: '$$propData.isRequired',
                                showInTable: '$$propData.showInTable',
                                showInStatistics: '$$propData.showInStatistics',
                              },
                              options: {
                                $map: {
                                  input: {
                                    $filter: {
                                      input: '$productPropertyOptions',
                                      as: 'option',
                                      cond: { $in: ['$$option._id', '$$propValueIds'] },
                                    },
                                  },
                                  as: 'option',
                                  in: {
                                    id: '$$option._id',
                                    names: '$$option.names',
                                    color: '$$option.color',
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    categories: {
                      $map: {
                        input: { $ifNull: ['$categories', []] },
                        as: 'prop',
                        in: {
                          id: '$$prop._id',
                          names: '$$prop.names',
                        },
                      },
                    },
                    barcodes: {
                      $map: {
                        input: { $ifNull: ['$barcodes', []] },
                        as: 'barcode',
                        in: {
                          id: '$$barcode._id',
                          code: '$$barcode.code',
                        },
                      },
                    },
                  },
                },
                {
                  $project: productProjection,
                },
              ],
              as: 'product',
            },
          },
          {
            $lookup: {
              from: 'currencies',
              localField: 'purchaseCurrencyId',
              foreignField: '_id',
              as: 'purchaseCurrency',
            },
          },
          {
            $addFields: {
              product: {
                $first: '$product',
              },
              currency: { $arrayElemAt: ['$currency', 0] },
              purchaseCurrency: {
                $ifNull: [
                  { $arrayElemAt: ['$purchaseCurrency', 0] },
                  { $arrayElemAt: ['$currency', 0] },
                ],
              },
            },
          },
          {
            $project: projection,
          },
        ],
        count: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await OrderItemModel.aggregate<AggregateResult<OrderItemDBPopulated>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function listPayments({ payload }: { payload: GetOrderPaymentsRepoPayload }): Promise<GetOrderPaymentsRepoResult> {
  const {
    current,
    pageSize,
    full,
  } = payload.pagination

  const {
    order,
    paymentDate,
  } = payload.filters

  const query = buildQuery({
    filters: {
      documentType: 'order',
      documentId: order,
      createdAt: paymentDate,
      cancelled: false,
    },
    rules: {
      documentType: { type: 'exact' },
      documentId: { type: 'array' },
      createdAt: { type: 'dateRange' },
      cancelled: { type: 'exact' },
    },
    removed: false,
  })

  const sorters = buildSortQuery(payload.sorters, { createdAt: -1 })

  const pipeline: PipelineStage[] = [
    { $match: query },
    { $sort: sorters },
    {
      $facet: {
        items: [
          ...(full
            ? []
            : [
                { $skip: (current - 1) * pageSize },
                { $limit: pageSize },
              ]),
          {
            $lookup: {
              from: 'money-transactions',
              localField: 'moneyTransactionId',
              foreignField: '_id',
              as: 'transaction',
            },
          },
          {
            $lookup: {
              from: 'currencies',
              localField: 'currencyId',
              foreignField: '_id',
              as: 'currency',
            },
          },
          {
            $addFields: {
              transaction: { $arrayElemAt: ['$transaction', 0] },
              currency: { $arrayElemAt: ['$currency', 0] },
            },
          },
          {
            $lookup: {
              from: 'cashregisters',
              localField: 'transaction.cashregisterId',
              foreignField: '_id',
              as: 'cashregister',
            },
          },
          {
            $lookup: {
              from: 'cashregister-accounts',
              localField: 'transaction.accountId',
              foreignField: '_id',
              as: 'cashregisterAccount',
            },
          },
          {
            $addFields: {
              cashregister: { $arrayElemAt: ['$cashregister', 0] },
              cashregisterAccount: { $arrayElemAt: ['$cashregisterAccount', 0] },
            },
          },
          {
            $project: {
              _id: 1,
              orderId: '$documentId',
              cashregister: { id: '$cashregister._id', names: '$cashregister.names' },
              cashregisterAccount: { id: '$cashregisterAccount._id', names: '$cashregisterAccount.names' },
              currency: { id: '$currency._id', names: '$currency.names', symbols: '$currency.symbols', scale: { $ifNull: ['$currency.scale', 2] } },
              minorAmount: 1,
              paymentDate: '$createdAt',
              transactionId: '$moneyTransactionId',
              comment: 1,
              createdBy: 1,
              removedBy: '$cancelledBy',
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        count: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await PaymentApplicationModel.aggregate<AggregateResult<OrderPaymentDBPopulated>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne({ payload, session }: { payload: CreateOrderRepoPayload, session?: ClientSession }) {
  return OrderModel.create([payload], { session })
}

export async function createOneItem({ payload, session }: { payload: CreateOrderItemRepoPayload, session?: ClientSession }) {
  return OrderItemModel.create([payload], { session })
}

export async function updateById({ id, payload, session }: { id: string, payload: EditOrderRepoPayload, session?: ClientSession }) {
  return OrderModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true, session },
  ).exec()
}

export async function updateOneItem({ payload, session }: { payload: EditOrderItemRepoPayload, session?: ClientSession }) {
  // Never $set _id/id — legacy order-items still use ObjectId-string ids and uuidValidator rejects them.
  const { id, ...rest } = payload as EditOrderItemRepoPayload & { _id?: string }
  const update = { ...rest }
  delete update._id

  return OrderItemModel.findOneAndUpdate(
    { _id: id },
    { $set: update as unknown as Record<string, unknown> },
    { new: true, runValidators: true, session },
  ).exec()
}

export type OrderWithPopulatedClient = Omit<OrderDB, 'clientId'> & {
  clientId: {
    _id: string
    name?: string
    lastName?: string
    middleName?: string
    phones?: string[]
    emails?: string[]
  } | null
}

export async function findOne({ payload, session }: { payload: FindOneOrderRepoPayload, session?: ClientSession }): Promise<OrderWithPopulatedClient | null> {
  const { id, seq } = payload
  const order = await OrderModel.findOne(
    { $or: [{ _id: id }, { seq }] },
    undefined,
    { session },
  )
    .populate('clientId', 'name lastName middleName phones emails')
    .lean()
    .exec()

  return order as unknown as OrderWithPopulatedClient | null
}

export async function findById(id: string) {
  return OrderModel.findById(id).exec()
}

export async function listIdsByClientIds(clientIds: string[]) {
  if (clientIds.length === 0)
    return []

  return OrderModel.find({
    clientId: { $in: clientIds },
    removed: { $ne: true },
  }).select({ _id: 1, clientId: 1, orderPaymentStatus: 1 }).sort({ createdAt: 1 }).lean().exec()
}

export async function sumItemMinorsByOrderIds(orderIds: string[]) {
  if (orderIds.length === 0)
    return []

  return OrderItemModel.aggregate<Array<{
    orderId: string
    currencyId: string
    minorAmount: number
  }>[number]>([
    {
      $match: {
        orderId: { $in: orderIds },
        removed: { $ne: true },
      },
    },
    {
      $group: {
        _id: {
          orderId: '$orderId',
          currencyId: '$currencyId',
        },
        minorAmount: {
          $sum: {
            $multiply: [
              { $ifNull: ['$minorPrice', 0] },
              { $ifNull: ['$quantity', 0] },
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        orderId: '$_id.orderId',
        currencyId: '$_id.currencyId',
        minorAmount: 1,
      },
    },
  ]).exec()
}

export async function sumOpenItemMinorsByOrder() {
  return OrderModel.aggregate<{
    orderId: string
    clientId: string | null
    currencyId: string
    minorAmount: number
  }>([
    {
      $match: {
        removed: { $ne: true },
        orderPaymentStatus: { $ne: 'paid' },
      },
    },
    {
      $lookup: {
        from: 'order-items',
        localField: '_id',
        foreignField: 'orderId',
        as: 'items',
      },
    },
    { $unwind: '$items' },
    { $match: { 'items.removed': { $ne: true } } },
    {
      $group: {
        _id: {
          orderId: '$_id',
          clientId: '$clientId',
          currencyId: '$items.currencyId',
        },
        minorAmount: {
          $sum: {
            $multiply: [
              { $ifNull: ['$items.minorPrice', 0] },
              { $ifNull: ['$items.quantity', 0] },
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        orderId: '$_id.orderId',
        clientId: '$_id.clientId',
        currencyId: '$_id.currencyId',
        minorAmount: 1,
      },
    },
  ]).exec()
}

export async function sumOpenItemMinorsByClient(clientIds: string[]) {
  if (clientIds.length === 0)
    return []

  return OrderModel.aggregate<Array<{
    clientId: string
    currencyId: string
    minorAmount: number
  }>[number]>([
    {
      $match: {
        clientId: { $in: clientIds },
        removed: { $ne: true },
        orderPaymentStatus: { $ne: 'paid' },
      },
    },
    {
      $lookup: {
        from: 'order-items',
        localField: '_id',
        foreignField: 'orderId',
        as: 'items',
      },
    },
    { $unwind: '$items' },
    { $match: { 'items.removed': { $ne: true } } },
    {
      $group: {
        _id: {
          clientId: '$clientId',
          currencyId: '$items.currencyId',
        },
        minorAmount: {
          $sum: {
            $multiply: [
              { $ifNull: ['$items.minorPrice', 0] },
              { $ifNull: ['$items.quantity', 0] },
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        clientId: '$_id.clientId',
        currencyId: '$_id.currencyId',
        minorAmount: 1,
      },
    },
  ]).exec()
}

export async function removeById(id: string, options?: { removedBy?: string, session?: ClientSession }) {
  return OrderModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true, ...(options?.removedBy !== undefined ? { removedBy: options.removedBy } : {}) } },
    { new: true, runValidators: true, session: options?.session },
  ).exec()
}

export async function patchById({
  id,
  payload,
  session,
}: {
  id: string
  payload: Record<string, unknown>
  session?: ClientSession
}) {
  return OrderModel.findOneAndUpdate(
    { _id: id },
    { $set: payload },
    { new: true, runValidators: true, session },
  ).exec()
}

export async function listForTracking(options: { staleBefore?: Date } = {}) {
  const query: Record<string, unknown> = {
    'removed': { $ne: true },
    'delivery.shipment.trackingNumber': { $exists: true, $nin: [null, ''] },
  }

  if (options.staleBefore != null) {
    query.$or = [
      { 'delivery.shipment.lastSyncedAt': { $exists: false } },
      { 'delivery.shipment.lastSyncedAt': null },
      { 'delivery.shipment.lastSyncedAt': { $lt: options.staleBefore } },
    ]
  }

  return OrderModel.find(query).select({
    _id: 1,
    deliveryServiceId: 1,
    orderStatusId: 1,
    delivery: 1,
  }).lean<{
    _id: string
    deliveryServiceId: string
    orderStatusId: string
    delivery?: OrderDeliveryDTO
  }[]>().exec()
}
