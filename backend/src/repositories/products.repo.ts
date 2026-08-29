import type { AggregateResult } from '@remnant/shared'
import type { AnyBulkWriteOperation, ClientSession, PipelineStage } from 'mongoose'
import type {
  CreateProductsRepoPayload,
  EditProductsRepoPayload,
  GetProductsIndexRepoPayload,
  GetProductsRepoPayload,
  GetProductsRepoResult,
  ProductDB,
  ProductDBPopulated,
} from '@/types'
import { ProductModel, QuantityModel } from '@/models'
import * as CurrencyRepo from '@/repositories/currencies.repo'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'
import { toMinor } from '@/utils/money'

async function toMinorFilterValue(
  amount: number | undefined,
  currencyIds: string[] | undefined,
): Promise<number | undefined> {
  if (amount === undefined)
    return undefined

  const currencyId = currencyIds?.length === 1 ? currencyIds[0] : undefined
  if (currencyId === undefined)
    return amount

  const currency = await CurrencyRepo.findOne({ _id: currencyId })
  if (!currency)
    return amount

  return toMinor(amount, currency.scale)
}

export async function list(payload: GetProductsRepoPayload): Promise<GetProductsRepoResult> {
  const {
    current,
    pageSize,
    full,
  } = payload.pagination

  const {
    search,
    ids,
    seq,
    names,
    language,
    price,
    currency,
    purchasePrice,
    purchaseCurrency,
    barcodes,
    categories,
    unit,
    productPropertiesGroup,
    productProperties,
    selectedWarehouse,
    stockStatusId,
    createdAt,
    updatedAt,
  } = payload.filters

  const minorPriceFilter = await toMinorFilterValue(price, currency)
  const minorPurchasePriceFilter = await toMinorFilterValue(purchasePrice, purchaseCurrency)

  let scopedIds = ids
  if (stockStatusId !== undefined && selectedWarehouse !== undefined) {
    const matchedProductIds = await QuantityModel.distinct('productId', {
      warehouseId: selectedWarehouse,
      stockStatusId,
    }).exec()

    if (scopedIds !== undefined && scopedIds.length > 0) {
      const scopedSet = new Set(scopedIds)
      scopedIds = matchedProductIds.filter(id => scopedSet.has(id))
    }
    else {
      scopedIds = matchedProductIds
    }
  }

  const query = buildQuery({
    filters: {
      _id: scopedIds,
      seq,
      names,
      price: minorPriceFilter,
      purchasePrice: minorPurchasePriceFilter,
      barcodes,
      categories,
      unit,
      productPropertiesGroup,
      productProperties,
      createdAt,
      updatedAt,
      currency,
      purchaseCurrency,
    },
    rules: {
      _id: { type: 'array' },
      seq: { type: 'exact' },
      names: { type: 'string', langAware: true },
      price: { type: 'exact', field: 'minorPrice' },
      purchasePrice: { type: 'exact', field: 'minorPurchasePrice' },
      currency: { type: 'array', field: 'currencyId' },
      purchaseCurrency: { type: 'array', field: 'purchaseCurrencyId' },
      barcodes: { type: 'string', field: 'barcodeIds' },
      categories: { type: 'array', field: 'categoryIds' },
      unit: { type: 'array', field: 'unitId' },
      productPropertiesGroup: { type: 'array', field: 'productPropertiesGroupId' },
      productProperties: { type: 'array' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
  })

  const querySearch = buildQuery({
    filters: {
      search,
    },
    rules: {
      search: {
        type: 'multiFieldSearch',
        multiFields: [
          { field: `names`, langAware: true },
          { field: `categories.names`, langAware: true, isArray: true },
        ],
      },
    },
    language,
    removed: false,
  })

  const sorters = buildSortQuery(payload.sorters, { seq: 1, _id: 1 }, { _id: 1 })

  // if (payload.sorters?.productProperties) {
  //   payload.sorters.productPropertiesSort = payload.sorters.productProperties
  //   delete payload.sorters.productProperties
  // }

  // if (payload.sorters?.quantity) {
  //   payload.sorters.quantitySort = payload.sorters.quantity
  //   delete payload.sorters.quantity
  // }

  const pipeline: PipelineStage[] = [
    { $match: query },
    { $match: querySearch },
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

          {
            $lookup: {
              from: 'quantities',
              let: { quantityIds: '$quantityIds' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$_id', { $ifNull: ['$$quantityIds', []] }],
                    },
                  },
                },
                {
                  $lookup: {
                    from: 'product-stock-statuses',
                    localField: 'stockStatusId',
                    foreignField: '_id',
                    as: '_stockStatus',
                  },
                },
                {
                  $project: {
                    warehouseId: 1,
                    count: 1,
                    stockStatus: {
                      $cond: [
                        { $gt: [{ $size: '$_stockStatus' }, 0] },
                        {
                          $let: {
                            vars: { s: { $arrayElemAt: ['$_stockStatus', 0] } },
                            in: {
                              id: '$$s._id',
                              names: '$$s.names',
                              color: '$$s.color',
                            },
                          },
                        },
                        null,
                      ],
                    },
                  },
                },
              ],
              as: 'warehouseStock',
            },
          },

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
            $addFields: {
              currency: { $arrayElemAt: ['$currency', 0] },
              purchaseCurrency: { $arrayElemAt: ['$purchaseCurrency', 0] },
              unit: { $arrayElemAt: ['$unit', 0] },
              productPropertiesGroup: {
                $arrayElemAt: ['$productPropertiesGroup', 0],
              },
            },
          },
          {
            $addFields: {
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
                        $mergeObjects: [
                          '$$prop',
                          {
                            id: '$$prop._id',

                            data: {
                              id: '$$propData._id',
                              names: '$$propData.names',
                              symbols: '$$propData.symbols',
                              type: '$$propData.type',
                              isRequired: '$$propData.isRequired',
                              showInTable: '$$propData.showInTable',
                            },

                            options: {
                              $map: {
                                input: {
                                  $filter: {
                                    input: '$productPropertyOptions',
                                    as: 'option',
                                    cond: {
                                      $in: ['$$option._id', '$$propValueIds'],
                                    },
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
                        ],
                      },
                    },
                  },
                },
              },

              categories: {
                $map: {
                  input: { $ifNull: ['$categories', []] },
                  as: 'category',
                  in: {
                    id: '$$category._id',
                    names: '$$category.names',
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
            $unset: [
              'productPropertiesData',
              'productPropertyOptions',
              'productPropertyOptionIds',
              'productProperties._id',
            ],
          },
          {
            $project: {
              _id: 0,
              id: '$_id',
              seq: 1,
              names: 1,
              minorPrice: 1,
              images: 1,
              createdAt: 1,
              updatedAt: 1,
              currency: {
                id: '$currency._id',
                names: '$currency.names',
                symbols: '$currency.symbols',
                scale: '$currency.scale',
              },
              minorPurchasePrice: {
                $cond: [
                  payload.hasPurchasePricePermission,
                  '$minorPurchasePrice',
                  '$$REMOVE',
                ],
              },
              purchaseCurrency: {
                $cond: [
                  payload.hasPurchasePricePermission,
                  {
                    id: '$purchaseCurrency._id',
                    names: '$purchaseCurrency.names',
                    symbols: '$purchaseCurrency.symbols',
                    scale: '$purchaseCurrency.scale',
                  },
                  '$$REMOVE',
                ],
              },
              unit: {
                id: '$unit._id',
                names: '$unit.names',
                symbols: '$unit.symbols',
              },
              categories: 1,
              barcodes: 1,
              warehouseStock: {
                $map: {
                  input: { $ifNull: ['$warehouseStock', []] },
                  as: 'stock',
                  in: {
                    warehouseId: '$$stock.warehouseId',
                    count: '$$stock.count',
                    stockStatus: '$$stock.stockStatus',
                  },
                },
              },
              productProperties: {
                id: 1,
                value: 1,
                data: {
                  id: 1,
                  names: 1,
                  symbols: 1,
                  type: 1,
                  isRequired: 1,
                  showInTable: 1,
                },
                options: {
                  id: 1,
                  names: 1,
                  color: 1,
                },
              },
              productPropertiesGroup: {
                id: '$productPropertiesGroup._id',
                names: '$productPropertiesGroup.names',
              },
            },
          },
        ],

        count: [
          {
            $count: 'count',
          },
        ],
      },
    },
  ]

  const raw = await ProductModel.aggregate<AggregateResult<ProductDBPopulated>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function findIndex(payload: GetProductsIndexRepoPayload) {
  const {
    search,
    ids,
    seq,
    names,
    language,
    price,
    purchasePrice,
    barcodes,
    categories,
    unit,
    productPropertiesGroup,
    productProperties,
  } = payload.filters

  const minorPriceFilter = await toMinorFilterValue(price, undefined)
  const minorPurchasePriceFilter = await toMinorFilterValue(purchasePrice, undefined)

  const query = buildQuery({
    filters: { _id: ids, seq, names, price: minorPriceFilter, purchasePrice: minorPurchasePriceFilter, barcodes, categories, unit, productPropertiesGroup, productProperties },
    rules: {
      _id: { type: 'array' },
      seq: { type: 'exact' },
      names: { type: 'string', langAware: true },
      active: { type: 'array' },
      price: { type: 'exact', field: 'minorPrice' },
      purchasePrice: { type: 'exact', field: 'minorPurchasePrice' },
      barcodes: { type: 'array' },
      categories: { type: 'array' },
      unit: { type: 'exact' },
      productPropertiesGroup: { type: 'exact' },
      productProperties: { type: 'array' },
    },
    language,
  })

  const queryLast = buildQuery({
    filters: { barcodes, categories, unit, productPropertiesGroup, productProperties, search },
    rules: {
      search: {
        type: 'multiFieldSearch',
        multiFields: [
          { field: `names`, langAware: true },
          { field: `categories.names`, langAware: true, isArray: true },
        ],
      },
    },
    language,
    removed: false,
  })

  const pipeline = [
    {
      $match: query,
    },
    {
      $match: queryLast,
    },
  ]

  const productsRaw = await ProductModel.aggregate(pipeline).exec()

  const productIndex = productsRaw.findIndex((doc: ProductDB) => String(doc._id) === String(payload.productId))

  return productIndex
}

export async function createOne(payload: CreateProductsRepoPayload) {
  return ProductModel.create(payload)
}

export async function bulkWrite(payload: AnyBulkWriteOperation<any>[]) {
  return ProductModel.bulkWrite(payload)
}

export async function updateById(id: string, payload: EditProductsRepoPayload) {
  return ProductModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function removeById(id: string) {
  return ProductModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}

export async function findByIds(payload: { ids: string[] }) {
  return ProductModel.find({ _id: { $in: payload.ids } }).lean<ProductDB[]>().exec()
}

export async function listIds(): Promise<string[]> {
  const docs = await ProductModel.find({ removed: { $ne: true } }).select({ _id: 1 }).lean().exec()
  return docs.map(doc => doc._id)
}

export async function findById(id: string, session?: ClientSession) {
  return ProductModel.findById(id, null, { session }).lean<ProductDB>().exec()
}

export async function addBarcodeToProducts(productIds: string[], barcodeId: string) {
  return ProductModel.updateMany(
    { _id: { $in: productIds } },
    { $push: { barcodeIds: barcodeId } },
  ).exec()
}

export async function removeBarcodeFromProducts(barcodeId: string) {
  return ProductModel.updateMany(
    { barcodeIds: barcodeId },
    { $pull: { barcodeIds: barcodeId } },
  ).exec()
}

export async function addQuantityToProducts({ productIds, quantityId, session }: { productIds: string[], quantityId: string, session?: ClientSession }) {
  return ProductModel.findOneAndUpdate(
    { _id: { $in: productIds } },
    { $push: { quantityIds: quantityId } },
    { new: true, runValidators: true, session },
  ).exec()
}

export function productPopulatedStages({
  productIdPath = '$productId',
  as = 'product',
  selectedWarehouse,
  hasPurchasePricePermission = true,
  unwrap,
  many = false,
}: {
  productIdPath?: string
  as?: string
  selectedWarehouse?: string
  hasPurchasePricePermission?: boolean
  unwrap?: boolean
  many?: boolean
} = {}): PipelineStage[] {
  const shouldUnwrap = unwrap ?? !many

  type LookupPipeline = NonNullable<PipelineStage.Lookup['$lookup']['pipeline']>

  const productPipeline: LookupPipeline = [
    {
      $match: {
        $expr: many
          ? {
              $in: [
                '$_id',
                {
                  $ifNull: ['$$productIds', []],
                },
              ],
            }
          : {
              $eq: ['$_id', '$$productId'],
            },
      },
    },

    {
      $unwind: {
        path: '$productProperties',
        preserveNullAndEmptyArrays: true,
      },
    },

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
        let: {
          value: '$productProperties.value',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: [
                  '$_id',
                  {
                    $cond: [
                      { $isArray: '$$value' },
                      '$$value',
                      {
                        $cond: [
                          { $ne: ['$$value', null] },
                          ['$$value'],
                          [],
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'productProperties.options',
      },
    },

    {
      $group: {
        _id: '$_id',
        doc: {
          $first: '$$ROOT',
        },
        productProperties: {
          $push: '$productProperties',
        },
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

    {
      $lookup: {
        from: 'quantities',
        let: { quantityIds: '$quantityIds' },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ['$_id', { $ifNull: ['$$quantityIds', []] }],
              },
            },
          },
          {
            $lookup: {
              from: 'product-stock-statuses',
              localField: 'stockStatusId',
              foreignField: '_id',
              as: '_stockStatus',
            },
          },
          {
            $project: {
              warehouseId: 1,
              count: 1,
              stockStatus: {
                $cond: [
                  { $gt: [{ $size: '$_stockStatus' }, 0] },
                  {
                    $let: {
                      vars: { s: { $arrayElemAt: ['$_stockStatus', 0] } },
                      in: {
                        id: '$$s._id',
                        names: '$$s.names',
                        color: '$$s.color',
                      },
                    },
                  },
                  null,
                ],
              },
            },
          },
        ],
        as: 'warehouseStock',
      },
    },

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
        currency: {
          $arrayElemAt: ['$currency', 0],
        },
        purchaseCurrency: {
          $arrayElemAt: ['$purchaseCurrency', 0],
        },
        unit: {
          $arrayElemAt: ['$unit', 0],
        },
        productPropertiesGroup: {
          $arrayElemAt: ['$productPropertiesGroup', 0],
        },
        productProperties: {
          $filter: {
            input: {
              $map: {
                input: '$productProperties',
                as: 'prop',
                in: {
                  id: '$$prop._id',
                  value: '$$prop.value',
                  data: {
                    $let: {
                      vars: {
                        data: {
                          $arrayElemAt: ['$$prop.data', 0],
                        },
                      },
                      in: {
                        id: '$$data._id',
                        names: '$$data.names',
                        symbols: '$$data.symbols',
                        type: '$$data.type',
                        isRequired: '$$data.isRequired',
                        showInTable: '$$data.showInTable',
                      },
                    },
                  },
                  options: {
                    $map: {
                      input: '$$prop.options',
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
            as: 'prop',
            cond: {
              $ne: ['$$prop.id', null],
            },
          },
        },
        categories: {
          $map: {
            input: '$categories',
            as: 'category',
            in: {
              id: '$$category._id',
              names: '$$category.names',
            },
          },
        },
        barcodes: {
          $map: {
            input: '$barcodes',
            as: 'barcode',
            in: {
              id: '$$barcode._id',
              code: '$$barcode.code',
            },
          },
        },
      },
    },
  ]

  if (selectedWarehouse !== undefined) {
    productPipeline.push({
      $addFields: {
        quantitySort: {
          $let: {
            vars: {
              hit: {
                $first: {
                  $filter: {
                    input: '$warehouseStock',
                    as: 'q',
                    cond: {
                      $eq: ['$$q.warehouseId', selectedWarehouse],
                    },
                  },
                },
              },
            },
            in: {
              $ifNull: ['$$hit.count', 0],
            },
          },
        },
      },
    })
  }

  productPipeline.push({
    $project: {
      _id: 0,
      id: '$_id',
      seq: 1,
      names: 1,
      minorPrice: 1,
      currency: {
        id: '$currency._id',
        names: '$currency.names',
        symbols: '$currency.symbols',
        scale: '$currency.scale',
      },
      ...(hasPurchasePricePermission
        ? {
            minorPurchasePrice: 1,
            purchaseCurrency: {
              id: '$purchaseCurrency._id',
              names: '$purchaseCurrency.names',
              symbols: '$purchaseCurrency.symbols',
              scale: '$purchaseCurrency.scale',
            },
          }
        : {}),
      barcodes: 1,
      categories: 1,
      unit: {
        id: '$unit._id',
        names: '$unit.names',
        symbols: '$unit.symbols',
      },
      ...(selectedWarehouse !== undefined
        ? {
            quantitySort: 1,
          }
        : {}),
      warehouseStock: {
        count: 1,
        warehouseId: 1,
        stockStatus: 1,
      },
      images: 1,
      productProperties: {
        id: 1,
        value: 1,
        data: {
          id: 1,
          names: 1,
          symbols: 1,
          type: 1,
          isRequired: 1,
          showInTable: 1,
        },
        options: {
          id: 1,
          names: 1,
          color: 1,
        },
      },
      productPropertiesGroup: {
        id: '$productPropertiesGroup._id',
        names: '$productPropertiesGroup.names',
      },
      createdAt: 1,
      updatedAt: 1,
    },
  })

  const stages: PipelineStage[] = [
    {
      $lookup: {
        from: 'products',
        let: many
          ? {
              productIds: productIdPath,
            }
          : {
              productId: productIdPath,
            },
        pipeline: productPipeline,
        as,
      },
    },
  ]

  if (shouldUnwrap) {
    stages.push({
      $addFields: {
        [as]: {
          $first: `$${as}`,
        },
      },
    })
  }

  return stages
}
