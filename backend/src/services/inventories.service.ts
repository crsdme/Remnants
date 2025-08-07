import type { RequestUser } from '../types/common.type'
import type * as InventoriesTypes from '../types/inventories.type'
import { v4 as uuidv4 } from 'uuid'
import { STORAGE_URLS } from '../config/constants'
import { BarcodeModel, InventoryItemModel, InventoryModel } from '../models'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'
import * as ProductService from './product.service'
import * as QuantityService from './quantity.service'

export async function get(payload: InventoriesTypes.getInventoriesParams): Promise<InventoriesTypes.getInventoriesResult> {
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
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
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
      $addFields: {
        warehouse: {
          $first: '$warehouse',
        },
        category: {
          $first: '$category',
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        status: 1,
        warehouse: {
          $cond: {
            if: { $gt: ['$warehouse', null] },
            then: {
              id: '$warehouse._id',
              names: '$warehouse.names',
            },
            else: '$$REMOVE',
          },
        },
        category: {
          $cond: {
            if: { $gt: ['$category', null] },
            then: {
              id: '$category._id',
              names: '$category.names',
            },
            else: '$$REMOVE',
          },
        },
        comment: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $facet: {
        inventories: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const inventoriesRaw = await InventoryModel.aggregate(pipeline).exec()

  const inventories = inventoriesRaw[0].inventories || []
  const inventoriesCount = inventoriesRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'INVENTORIES_FETCHED', message: 'Inventories fetched', inventories, inventoriesCount }
}

export async function getItems(payload: InventoriesTypes.getInventoryItemsParams): Promise<InventoriesTypes.getInventoryItemsResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    inventoryId,
  } = payload.filters || {}

  const filterRules = {
    inventoryId: { type: 'string' },
  } as const

  const query = buildQuery({
    filters: { inventoryId },
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
        inventoryId: 1,
        createdAt: 1,
      },
    },
    {
      $facet: {
        inventoryItems: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const inventoryItemsRaw = await InventoryItemModel.aggregate(pipeline).exec()

  let inventoryItems = inventoryItemsRaw[0].inventoryItems || []
  const inventoryItemsCount = inventoryItemsRaw[0].totalCount[0]?.count || 0

  inventoryItems = inventoryItems.map((item: any) => ({
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

  return { status: 'success', code: 'INVENTORY_ITEMS_FETCHED', message: 'Inventory items fetched', inventoryItems, inventoryItemsCount }
}

export async function scanBarcodeToDraft(payload: InventoriesTypes.scanBarcodeToDraftParams): Promise<InventoriesTypes.scanBarcodeToDraftResult> {
  const { barcode, category } = payload.filters

  const filterRules = {
    code: { type: 'exact' },
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
  let inventoryItems = barcodeRaw[0].products || []

  inventoryItems = inventoryItems.map((item: any) => ({
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

  const { productIndex } = await ProductService.getIndex({
    filters: {
      productId: inventoryItems[0].product.id,
      categories: [category],
    },
  })

  return { status: 'success', code: 'INVENTORY_ITEMS_FETCHED', message: 'Inventory items fetched', inventoryItems, productIndex }
}

export async function create(payload: InventoriesTypes.createInventoryParams, user: RequestUser) {
  const { warehouse, category, comment, items } = payload
  const createdBy = user.id
  const inventoryId = uuidv4()

  const { products } = await ProductService.get({
    filters: {
      categories: [category],
    },
  })

  const inventory = await InventoryModel.create({
    _id: inventoryId,
    status: 'confirmed',
    warehouse,
    category,
    comment,
    createdBy,
  })

  const mappedItems = products.map((product) => {
    const item = items.find(p => p.id === product.id)

    if (!item) {
      const productQuantity = product.quantity.find(q => q.warehouse === warehouse)?.count || 0
      return {
        inventoryId,
        productId: product.id,
        quantity: productQuantity,
        receivedQuantity: 0,
      }
    }

    return {
      inventoryId,
      productId: item.id,
      quantity: item.quantity,
      receivedQuantity: item.receivedQuantity,
    }
  })

  for (const item of mappedItems) {
    QuantityService.count({
      product: item.productId,
      warehouse,
      count: item.receivedQuantity,
      mode: 'set',
    })
  }

  await InventoryItemModel.create(mappedItems)

  return { status: 'success', code: 'INVENTORY_CREATED', message: 'Inventory created', inventory }
}

export async function edit(payload: InventoriesTypes.editInventoryParams) {
  const { id, status, warehouse, comment, items } = payload

  const oldInventory = await InventoryModel.findById(id)

  const oldItems = await InventoryItemModel.find({ inventoryId: id })

  const inventory = await InventoryModel.findByIdAndUpdate(id, {
    status,
    warehouse,
    comment,
  }, { new: true })

  return { status: 'success', code: 'INVENTORY_EDITED', message: 'Inventory edited', inventory }
}

export async function remove(payload: InventoriesTypes.removeInventoriesParams, user: RequestUser) {
  const { ids } = payload
  const removedBy = user.id

  await InventoryModel.updateMany(
    { _id: { $in: ids } },
    { status: 'cancelled', removedBy, removedAt: new Date() },
  )

  for (const id of ids) {
    const inventory = await InventoryModel.findById(id)
    if (!inventory)
      continue

    const items = await InventoryItemModel.find({ inventoryId: id })
  }

  return { status: 'success', code: 'WAREHOUSE_TRANSACTION_REMOVED', message: 'Warehouse transaction removed' }
}
