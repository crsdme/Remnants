import type {
  createProcurementParams,
  editProcurementParams,
  getProcurementItemsParams,
  getProcurementItemsResult,
  getProcurementsParams,
  getProcurementsResult,
  payProcurementParams,
  removeProcurementsParams,
  RequestUser,
  scanBarcodeParams,
  scanBarcodeResult,
} from '@remnant/shared'
import { STORAGE_URLS } from '@/config/constants'
import { BarcodeModel, ProcurementItemModel, ProcurementModel } from '@/models/'
import * as MoneyTransactionService from '@/services/money-transaction.service'
import { HttpError } from '@/utils/'
import { buildQuery, buildSortQuery } from '@/utils/queryBuilder'

export async function get(payload: getProcurementsParams): Promise<getProcurementsResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    ids = [],
    seq = undefined,
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
    seq: { type: 'number' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { _id: ids, seq, createdAt, updatedAt },
    rules: filterRules,
    removed: false,
  })

  const sorters = buildSortQuery(payload.sorters || {}, { createdAt: -1 })

  const pipeline = [
    { $match: query },
    { $sort: sorters },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplier',
        foreignField: '_id',
        as: 'supplier',
      },
    },
    {
      $lookup: {
        from: 'procurement-items',
        localField: '_id',
        foreignField: 'procurementId',
        as: 'items',
      },
    },
    {
      $lookup: {
        from: 'money-transactions',
        localField: 'payments',
        foreignField: '_id',
        as: 'paymentsDocs',
      },
    },
    {
      $lookup: {
        from: 'currencies',
        localField: 'items.purchaseCurrency',
        foreignField: '_id',
        as: 'itemCurrencies',
      },
    },
    {
      $lookup: {
        from: 'currencies',
        localField: 'paymentsDocs.currency',
        foreignField: '_id',
        as: 'paymentCurrencies',
      },
    },

    {
      $addFields: {
        _itemsAgg: {
          $let: {
            vars: {
              grouped: {
                $reduce: {
                  input: '$items',
                  initialValue: [],
                  in: {
                    $let: {
                      vars: {
                        currId: '$$this.purchaseCurrency',
                        lineTotal: {
                          $multiply: [
                            { $ifNull: ['$$this.quantity', 0] },
                            { $ifNull: ['$$this.purchasePrice', 0] },
                          ],
                        },
                        acc: '$$value',
                      },
                      in: {
                        $cond: [
                          {
                            $in: [
                              '$$currId',
                              {
                                $map: {
                                  input: '$$acc',
                                  as: 'row',
                                  in: '$$row.currencyId',
                                },
                              },
                            ],
                          },
                          {
                            $map: {
                              input: '$$acc',
                              as: 'row',
                              in: {
                                $cond: [
                                  { $eq: ['$$row.currencyId', '$$currId'] },
                                  {
                                    currencyId: '$$row.currencyId',
                                    total: { $add: ['$$row.total', '$$lineTotal'] },
                                  },
                                  '$$row',
                                ],
                              },
                            },
                          },
                          {
                            $concatArrays: [
                              '$$acc',
                              [{ currencyId: '$$currId', total: '$$lineTotal' }],
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            in: '$$grouped',
          },
        },
      },
    },
    {
      $addFields: {
        _paymentsAgg: {
          $let: {
            vars: {
              grouped: {
                $reduce: {
                  input: '$paymentsDocs',
                  initialValue: [],
                  in: {
                    $let: {
                      vars: {
                        currId: '$$this.currency',
                        amount: { $ifNull: ['$$this.amount', 0] },
                        acc: '$$value',
                      },
                      in: {
                        $cond: [
                          {
                            $in: [
                              '$$currId',
                              {
                                $map: {
                                  input: '$$acc',
                                  as: 'row',
                                  in: '$$row.currencyId',
                                },
                              },
                            ],
                          },
                          {
                            $map: {
                              input: '$$acc',
                              as: 'row',
                              in: {
                                $cond: [
                                  { $eq: ['$$row.currencyId', '$$currId'] },
                                  {
                                    currencyId: '$$row.currencyId',
                                    total: { $add: ['$$row.total', '$$amount'] },
                                  },
                                  '$$row',
                                ],
                              },
                            },
                          },
                          {
                            $concatArrays: [
                              '$$acc',
                              [{ currencyId: '$$currId', total: '$$amount' }],
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            in: '$$grouped',
          },
        },
      },
    },
    {
      $addFields: {
        itemsByCurrency: {
          $map: {
            input: '$_itemsAgg',
            as: 'row',
            in: {
              currency: {
                $first: {
                  $filter: {
                    input: '$itemCurrencies',
                    as: 'cur',
                    cond: { $eq: ['$$cur._id', '$$row.currencyId'] },
                  },
                },
              },
              amount: '$$row.total',
            },
          },
        },
        paymentsByCurrency: {
          $map: {
            input: '$_paymentsAgg',
            as: 'row',
            in: {
              currency: {
                $first: {
                  $filter: {
                    input: '$paymentCurrencies',
                    as: 'cur',
                    cond: { $eq: ['$$cur._id', '$$row.currencyId'] },
                  },
                },
              },
              amount: '$$row.total',
            },
          },
        },
      },
    },
    {
      $addFields: {
        balanceByCurrency: {
          $map: {
            input: '$itemsByCurrency',
            as: 'it',
            in: {
              currency: '$$it.currency',
              amount: {
                $subtract: [
                  '$$it.amount',
                  {
                    $ifNull: [
                      {
                        $let: {
                          vars: {
                            pay: {
                              $first: {
                                $filter: {
                                  input: '$paymentsByCurrency',
                                  as: 'p',
                                  cond: {
                                    $eq: ['$$p.currency._id', '$$it.currency._id'],
                                  },
                                },
                              },
                            },
                          },
                          in: '$$pay.amount',
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        seq: 1,
        supplier: {
          $cond: [
            { $gt: [{ $size: '$supplier' }, 0] },
            {
              id: { $first: '$supplier._id' },
              name: { $first: '$supplier.name' },
            },
            '$$REMOVE',
          ],
        },
        status: 1,
        paymentStatus: 1,
        comment: 1,
        createdAt: 1,
        updatedAt: 1,

        itemsByCurrency: { currency: 1, amount: 1 },
        paymentsByCurrency: { currency: 1, amount: 1 },
        balanceByCurrency: { currency: 1, amount: 1 },
      },
    },
    {
      $facet: {
        procurements: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]

  const procurementsRaw = await ProcurementModel.aggregate(pipeline).exec()

  const procurements = procurementsRaw[0].procurements || []
  const procurementsCount = procurementsRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'PROCUREMENTS_FETCHED', message: 'Procurements fetched', procurements, procurementsCount }
}

export async function getItems(payload: getProcurementItemsParams): Promise<getProcurementItemsResult> {
  const { current = 1, pageSize = 10, full = false } = payload.pagination || {}

  const {
    procurementId,
  } = payload.filters || {}

  const filterRules = {
    procurementId: { type: 'string' },
  } as const

  const query = buildQuery({
    filters: { procurementId },
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
        let: { productId: '$productId' },
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
        procurementItems: full
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

  const procurementItemsRaw = await ProcurementItemModel.aggregate(pipeline).exec()

  let procurementItems = procurementItemsRaw[0].procurementItems || []
  const procurementItemsCount = procurementItemsRaw[0].totalCount[0]?.count || 0

  procurementItems = procurementItems.map((item: any) => ({
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

  return { status: 'success', code: 'PROCUREMENT_ITEMS_FETCHED', message: 'Procurement items fetched', procurementItems, procurementItemsCount }
}

export async function scanBarcode(payload: scanBarcodeParams): Promise<scanBarcodeResult> {
  const { barcode } = payload

  const filterRules = {
    code: { type: 'string' },
  } as const

  const query = buildQuery({
    filters: { code: barcode },
    rules: filterRules,
    removed: false,
  })

  const pipeline = [
    {
      $match: query,
    },
    {
      $unwind: {
        path: '$items',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'products',
        let: { productId: '$items._id' },
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
        as: 'items.product',
      },
    },
    {
      $group: {
        _id: '$_id',
        doc: { $first: '$$ROOT' },
        items: {
          $push: {
            quantity: '$items.quantity',
            product: { $first: '$items.product' },
          },
        },
      },
    },
    {
      $addFields: {
        'doc.items': '$items',
      },
    },
    {
      $replaceRoot: {
        newRoot: '$doc',
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        code: 1,
        items: 1,
      },
    },

  ]

  const barcodeRaw = await BarcodeModel.aggregate(pipeline).exec()
  let procurementItems = barcodeRaw[0].items || []

  procurementItems = procurementItems.map((item: any) => ({
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

  return { status: 'success', code: 'PROCUREMENT_ITEMS_FETCHED', message: 'Procurement items fetched', procurementItems }
}

export async function create(payload: createProcurementParams, user: RequestUser) {
  const { supplier, comment, items } = payload
  const createdBy = user.id

  const procurement = await ProcurementModel.create({
    supplier,
    status: 'draft',
    comment,
    createdBy,
  })

  const mappedProducts = items.map((item: any) => ({
    procurementId: procurement._id,
    purchasePrice: item.purchasePrice,
    purchaseCurrency: item.purchaseCurrency.id,
    productId: item.id,
    quantity: item.quantity,
  }))

  await ProcurementItemModel.create(mappedProducts)

  return { status: 'success', code: 'PROCUREMENT_CREATED', message: 'Procurement created', procurement }
}

export async function edit(payload: editProcurementParams, user: RequestUser) {
  const { id, supplier, status, warehouse, expenses, payments, comment } = payload

  // const oldProcurement = await ProcurementModel.findById(id)

  const procurement = await ProcurementModel.findByIdAndUpdate(id, {
    supplier,
    status,
    warehouse,
    expenses,
    payments,
    comment,
    updatedBy: user.id,
  }, { new: true })

  return { status: 'success', code: 'PROCUREMENT_EDITED', message: 'Procurement edited', procurement }
}

export async function remove(payload: removeProcurementsParams, user: RequestUser) {
  const { ids } = payload
  const removedBy = user.id

  await ProcurementModel.updateMany(
    { _id: { $in: ids } },
    { status: 'cancelled', removedBy, removedAt: new Date() },
  )

  // for (const id of ids) {
  //   const procurement = await ProcurementModel.findById(id)
  //   if (!transaction)
  //     continue

  // const products = await ProcurementItemModel.find({ procurementId: id })

  // for (const product of products) {
  //   switch (procurement.status) {
  //     case 'in':
  //       await QuantityService.count({
  //         product: product.productId,
  //         warehouse: transaction.toWarehouse,
  //         count: -product.quantity,
  //         userId: user.id,
  //         refType: 'warehouse-transaction',
  //         refId: id,
  //       })
  //       break

  //     case 'out':
  //       await QuantityService.count({
  //         product: product.productId,
  //         warehouse: transaction.fromWarehouse,
  //         count: product.quantity,
  //         userId: user.id,
  //         refType: 'warehouse-transaction',
  //         refId: id,
  //       })
  //       break

  //     case 'transfer':
  //       await QuantityService.count({
  //         product: product.productId,
  //         warehouse: transaction.fromWarehouse,
  //         count: product.quantity,
  //         userId: user.id,
  //         refType: 'warehouse-transaction',
  //         refId: id,
  //       })

  //       if (transaction.accepted) {
  //         await QuantityService.count({
  //           product: product.productId,
  //           warehouse: transaction.toWarehouse,
  //           count: -product.quantity,
  //           userId: user.id,
  //           refType: 'warehouse-transaction',
  //           refId: id,
  //         })
  //       }
  //       break
  //   }
  // }
  // }

  return { status: 'success', code: 'PROCUREMENT_REMOVED', message: 'Procurement removed' }
}

export async function payProcurement(payload: payProcurementParams, user: RequestUser) {
  const { procurementId, cashregister, account, currency, amount, comment } = payload
  const createdBy = user.id

  const { status, code, message, moneyTransaction } = await MoneyTransactionService.create({
    type: 'income',
    direction: 'out',
    account,
    cashregister,
    sourceModel: 'procurement',
    sourceId: procurementId,
    currency,
    amount,
    comment,
    createdBy,
  })

  if (status !== 'success') {
    throw new HttpError(400, message, code)
  }

  const procurement = await ProcurementModel.findByIdAndUpdate(procurementId, {
    $addToSet: { payments: moneyTransaction.id },
    updatedBy: user.id,
  })

  await updatePaymentStatus({ procurementId })

  return { status: 'success', code: 'PROCUREMENT_PAID', message: 'Procurement paid', procurement }
}

export async function updatePaymentStatus({ procurementId }: { procurementId: string }) {
  const { procurements } = await get({ filters: { ids: [procurementId] } })
  const procurement = procurements[0] || {}

  if (!procurement) {
    throw new HttpError(404, 'Procurement not found', 'PROCUREMENT_NOT_FOUND')
  }

  const items = procurement.itemsByCurrency || []
  const payments = procurement.paymentsByCurrency || []
  const balances = procurement.balanceByCurrency || []

  const summary = balances.map(b => ({
    currency: b.currency || '',
    due: items.find(i => i.currency?.id === b.currency?.id)?.amount || 0,
    paid: payments.find(p => p.currency?.id === b.currency?.id)?.amount || 0,
    balance: b.amount,
  }))

  let paymentStatus: 'unpaid' | 'partially-paid' | 'paid' | 'overpaid' = 'unpaid'

  const anyPaid = summary.some(s => s.paid > 0)
  const allZeroBalance = summary.every(s => s.balance === 0)
  const anyNegative = summary.some(s => s.balance < 0)

  if (!anyPaid) {
    paymentStatus = 'unpaid'
  }
  else if (anyNegative) {
    paymentStatus = 'overpaid'
  }
  else if (allZeroBalance) {
    paymentStatus = 'paid'
  }
  else {
    paymentStatus = 'partially-paid'
  }

  await ProcurementModel.findByIdAndUpdate(procurementId, { paymentStatus }, { new: true })

  return {
    status: 'success',
    paymentStatus,
    details: summary,
  }
}

export async function getPaymentStatus({ ids }: { ids: string[] }) {
  const { procurements } = await get({ filters: { ids } })
  const procurement = procurements[0] || {}

  if (!procurement) {
    throw new HttpError(404, 'Procurement not found', 'PROCUREMENT_NOT_FOUND')
  }

  const items = procurement.itemsByCurrency || []
  const payments = procurement.paymentsByCurrency || []
  const balances = procurement.balanceByCurrency || []

  const summary = balances.map(b => ({
    currency: b.currency || '',
    due: items.find(i => i.currency?.id === b.currency?.id)?.amount || 0,
    paid: payments.find(p => p.currency?.id === b.currency?.id)?.amount || 0,
    balance: b.amount,
  }))

  let paymentStatus: 'unpaid' | 'partially-paid' | 'paid' | 'overpaid' = 'unpaid'

  const anyPaid = summary.some(s => s.paid > 0)
  const allZeroBalance = summary.every(s => s.balance === 0)
  const anyNegative = summary.some(s => s.balance < 0)

  if (!anyPaid) {
    paymentStatus = 'unpaid'
  }
  else if (anyNegative) {
    paymentStatus = 'overpaid'
  }
  else if (allZeroBalance) {
    paymentStatus = 'paid'
  }
  else {
    paymentStatus = 'partially-paid'
  }

  return {
    status: 'success',
    paymentStatus,
    details: summary,
  }
}
