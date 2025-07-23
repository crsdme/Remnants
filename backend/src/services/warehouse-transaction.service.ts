import type { RequestUser } from '../types/common.type'
import type * as WarehouseTransactionTypes from '../types/warehouse-transaction.type'
import { STORAGE_URLS } from '../config/constants'
import { BarcodeModel, WarehouseTransactionItemModel, WarehouseTransactionModel } from '../models'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'
import * as QuantityService from './quantity.service'

export async function get(payload: WarehouseTransactionTypes.getWarehouseTransactionsParams): Promise<WarehouseTransactionTypes.getWarehouseTransactionsResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
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
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { createdAt, updatedAt },
    rules: filterRules,
    removed: false,
  })

  const sorters = buildSortQuery(payload.sorters || {}, { createdAt: -1 })

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $lookup: {
        from: 'warehouses',
        localField: 'fromWarehouse',
        foreignField: '_id',
        as: 'fromWarehouse',
      },
    },
    {
      $lookup: {
        from: 'warehouses',
        localField: 'toWarehouse',
        foreignField: '_id',
        as: 'toWarehouse',
      },
    },
    {
      $addFields: {
        fromWarehouse: {
          $first: '$fromWarehouse',
        },
        toWarehouse: {
          $first: '$toWarehouse',
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        type: 1,
        fromWarehouse: {
          $cond: {
            if: { $gt: ['$fromWarehouse', null] },
            then: {
              id: '$fromWarehouse._id',
              names: '$fromWarehouse.names',
            },
            else: '$$REMOVE',
          },
        },
        toWarehouse: {
          $cond: {
            if: { $gt: ['$toWarehouse', null] },
            then: {
              id: '$toWarehouse._id',
              names: '$toWarehouse.names',
            },
            else: '$$REMOVE',
          },
        },
        status: 1,
        comment: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $facet: {
        warehouseTransactions: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const warehouseTransactionsRaw = await WarehouseTransactionModel.aggregate(pipeline).exec()

  const warehouseTransactions = warehouseTransactionsRaw[0].warehouseTransactions || []
  const warehouseTransactionsCount = warehouseTransactionsRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'WAREHOUSE_TRANSACTIONS_FETCHED', message: 'Warehouse transactions fetched', warehouseTransactions, warehouseTransactionsCount }
}

export async function getItems(payload: WarehouseTransactionTypes.getWarehouseTransactionsItemsParams): Promise<WarehouseTransactionTypes.getWarehouseTransactionsItemsResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    transactionId,
  } = payload.filters || {}

  const filterRules = {
    transactionId: { type: 'string' },
  } as const

  const query = buildQuery({
    filters: { transactionId },
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
        warehouseTransactionsItems: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const warehouseTransactionsItemsRaw = await WarehouseTransactionItemModel.aggregate(pipeline).exec()

  let warehouseTransactionsItems = warehouseTransactionsItemsRaw[0].warehouseTransactionsItems || []
  const warehouseTransactionsItemsCount = warehouseTransactionsItemsRaw[0].totalCount[0]?.count || 0

  warehouseTransactionsItems = warehouseTransactionsItems.map((item: any) => ({
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

  return { status: 'success', code: 'WAREHOUSE_TRANSACTIONS_ITEMS_FETCHED', message: 'Warehouse transactions items fetched', warehouseTransactionsItems, warehouseTransactionsItemsCount }
}

export async function scanBarcodeToDraft(payload: WarehouseTransactionTypes.scanBarcodeToDraftParams): Promise<WarehouseTransactionTypes.scanBarcodeToDraftResult> {
  const { barcode, transactionId } = payload

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
        path: '$products',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'products',
        let: { productId: '$products._id' },
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
        as: 'products.product',
      },
    },
    {
      $group: {
        _id: '$_id',
        doc: { $first: '$$ROOT' },
        products: {
          $push: {
            quantity: '$products.quantity',
            product: { $first: '$products.product' }, // т.к. product — это массив из $lookup
          },
        },
      },
    },
    {
      $addFields: {
        'doc.products': '$products',
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
        products: 1,
      },
    },

  ]

  const barcodeRaw = await BarcodeModel.aggregate(pipeline).exec()
  let warehouseItems = barcodeRaw[0].products || []

  warehouseItems = warehouseItems.map((item: any) => ({
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

  return { status: 'success', code: 'WAREHOUSE_ITEM_FETCHED', message: 'Warehouse item fetched', warehouseItems, transactionId }
}

export async function create(payload: WarehouseTransactionTypes.createWarehouseTransactionParams, user: RequestUser) {
  const { type, fromWarehouse, toWarehouse, requiresReceiving, comment, products } = payload
  const createdBy = user.id

  const warehouseTransaction = await WarehouseTransactionModel.create({
    type,
    fromWarehouse,
    toWarehouse,
    requiresReceiving,
    comment,
    createdBy,
    status: requiresReceiving ? 'awaiting' : 'confirmed',
  })

  const mappedProducts = products.map(product => ({
    transactionId: warehouseTransaction._id,
    productId: product.id,
    quantity: product.quantity,
  }))

  if (fromWarehouse) {
    mappedProducts.forEach((product) => {
      QuantityService.count({
        product: product.productId,
        warehouse: fromWarehouse,
        count: -product.quantity,
      })
    })
  }

  if (toWarehouse && !requiresReceiving) {
    mappedProducts.forEach((product) => {
      QuantityService.count({
        product: product.productId,
        warehouse: toWarehouse,
        count: product.quantity,
      })
    })
  }

  await WarehouseTransactionItemModel.create(mappedProducts)

  return { status: 'success', code: 'WAREHOUSE_TRANSACTION_CREATED', message: 'Warehouse transaction created', warehouseTransaction }
}

export async function edit(payload: WarehouseTransactionTypes.editWarehouseTransactionParams) {
  const { id, type, fromWarehouse = null, toWarehouse = null, requiresReceiving = false, comment, products } = payload

  const oldTransaction = await WarehouseTransactionModel.findById(id)

  const oldProducts = await WarehouseTransactionItemModel.find({ transactionId: id })

  const warehouseTransaction = await WarehouseTransactionModel.findByIdAndUpdate(id, {
    type,
    fromWarehouse,
    toWarehouse,
    requiresReceiving,
    comment,
    status: requiresReceiving ? 'awaiting' : 'confirmed',
  }, { new: true })

  for (const product of oldProducts) {
    if (oldTransaction?.fromWarehouse) {
      await QuantityService.count({
        product: product.productId,
        warehouse: oldTransaction.fromWarehouse,
        count: product.quantity,
      })
    }
    if (oldTransaction?.toWarehouse && !oldTransaction.requiresReceiving) {
      await QuantityService.count({
        product: product.productId,
        warehouse: oldTransaction.toWarehouse,
        count: -product.quantity,
      })
    }
  }

  for (const product of products) {
    if (fromWarehouse) {
      await QuantityService.count({
        product: product.id,
        warehouse: fromWarehouse,
        count: -product.quantity,
      })
    }
    if (toWarehouse && !requiresReceiving) {
      await QuantityService.count({
        product: product.id,
        warehouse: toWarehouse,
        count: product.quantity,
      })
    }
  }

  return { status: 'success', code: 'WAREHOUSE_TRANSACTION_EDITED', message: 'Warehouse transaction edited', warehouseTransaction }
}

export async function remove(payload: WarehouseTransactionTypes.removeWarehouseTransactionsParams, user: RequestUser) {
  const { ids } = payload
  const removedBy = user.id

  await WarehouseTransactionModel.updateMany(
    { _id: { $in: ids } },
    { status: 'cancelled', removedBy, removedAt: new Date() },
  )

  for (const id of ids) {
    const transaction = await WarehouseTransactionModel.findById(id)
    if (!transaction)
      continue

    const products = await WarehouseTransactionItemModel.find({ transactionId: id })

    for (const product of products) {
      switch (transaction.type) {
        case 'in':
          await QuantityService.count({
            product: product.productId,
            warehouse: transaction.toWarehouse,
            count: -product.quantity,
          })
          break

        case 'out':
          await QuantityService.count({
            product: product.productId,
            warehouse: transaction.fromWarehouse,
            count: product.quantity,
          })
          break

        case 'transfer':
          await QuantityService.count({
            product: product.productId,
            warehouse: transaction.fromWarehouse,
            count: product.quantity,
          })

          if (transaction.accepted) {
            await QuantityService.count({
              product: product.productId,
              warehouse: transaction.toWarehouse,
              count: -product.quantity,
            })
          }
          break
      }
    }
  }

  return { status: 'success', code: 'WAREHOUSE_TRANSACTION_REMOVED', message: 'Warehouse transaction removed' }
}

export async function receive(payload: WarehouseTransactionTypes.receiveWarehouseTransactionParams, user: RequestUser) {
  const { id, products } = payload
  const acceptedBy = user.id

  const warehouseTransaction = await WarehouseTransactionModel.findByIdAndUpdate(id, {
    status: 'received',
    acceptedBy,
    acceptedAt: new Date(),
    accepted: true,
  }, { new: true })

  const mappedProducts = products.map(product => ({
    transactionId: id,
    productId: product.id,
    quantity: product.quantity,
    receivedQuantity: product.receivedQuantity,
  }))

  if (warehouseTransaction?.toWarehouse) {
    mappedProducts.forEach((product) => {
      QuantityService.count({
        product: product.productId,
        warehouse: warehouseTransaction.toWarehouse,
        count: product.receivedQuantity,
      })
    })
  }

  for (const product of mappedProducts) {
    await WarehouseTransactionItemModel.updateOne({
      transactionId: id,
      productId: product.productId,
    }, {
      $set: {
        receivedQuantity: product.receivedQuantity,
      },
    })
  }

  return { status: 'success', code: 'WAREHOUSE_TRANSACTION_RECEIVED', message: 'Warehouse transaction received', warehouseTransaction }
}
