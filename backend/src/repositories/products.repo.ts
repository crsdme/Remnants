import type { AggregateResult, ProductDTO } from '@remnant/shared'
import type { ClientSession, PipelineStage } from 'mongoose'
import type { CreateProductsRepoPayload, EditProductsRepoPayload, GetProductsRepoPayload, GetProductsRepoResult, ProductDB } from '@/types'
import { ProductModel } from '@/models'
import * as UserService from '@/services/user.service'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list({ payload }: { payload: GetProductsRepoPayload }): Promise<GetProductsRepoResult> {
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
    createdAt,
    updatedAt,
    selectedWarehouse,
  } = payload.filters

  const query = buildQuery({
    filters: {
      _id: ids,
      seq,
      names,
      price,
      purchasePrice,
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
      active: { type: 'array' },
      price: { type: 'exact' },
      purchasePrice: { type: 'exact' },
      currency: { type: 'array' },
      purchaseCurrency: { type: 'array' },
      barcodes: { type: 'string' },
      categories: { type: 'array' },
      unit: { type: 'array' },
      productPropertiesGroup: { type: 'array' },
      productProperties: { type: 'array' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
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

  const sorters = buildSortQuery(payload.sorters, { seq: 1, _id: 1 }, { seq: 1 })

  // if (payload.sorters?.productProperties) {
  //   payload.sorters.productPropertiesSort = payload.sorters.productProperties
  //   delete payload.sorters.productProperties
  // }

  // if (payload.sorters?.quantity) {
  //   payload.sorters.quantitySort = payload.sorters.quantity
  //   delete payload.sorters.quantity
  // }
  console.log(payload.user)
  const hasPurchasePricePermission = await UserService.checkPermission('product.purchasePrice', payload.user.id)

  const pipeline: PipelineStage[] = [
    { $match: query },
    { $sort: sorters },
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
        let: { valueArr: { $ifNull: ['$productProperties.value', []] } },
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
      $addFields: {
        productPropertiesSort: {
          $arrayToObject: {
            $map: {
              input: '$productProperties',
              as: 'pp',
              in: {
                k: { $toString: '$$pp.id' },
                v: {
                  $switch: {
                    branches: [
                      { case: { $in: ['$$pp.data.type', ['text', 'number']] }, then: '$$pp.value' },
                      { case: { $eq: ['$$pp.data.type', 'boolean'] }, then: { $cond: [{ $eq: ['$$pp.value', true] }, 1, 0] } },
                      {
                        case: { $in: ['$$pp.data.type', ['select', 'color']] },
                        then: {
                          $let: {
                            vars: {
                              names: {
                                $map: { input: '$$pp.optionData', as: 'opt', in: { $ifNull: [`$$opt.names.${language}`, ''] } },
                              },
                            },
                            in: { $ifNull: [{ $arrayElemAt: ['$$names', 0] }, ''] },
                          },
                        },
                      },
                      {
                        case: { $eq: ['$$pp.data.type', 'multiSelect'] },
                        then: {
                          $let: {
                            vars: {
                              names: { $map: { input: '$$pp.optionData', as: 'opt', in: { $ifNull: [`$$opt.names.${language}`, ''] } } },
                            },
                            in: {
                              $reduce: {
                                input: { $sortArray: { input: '$$names', sortBy: 1 } },
                                initialValue: '',
                                in: { $concat: [{ $cond: [{ $eq: ['$$value', ''] }, '', { $concat: ['$$value', ','] }] }, '$$this'] },
                              },
                            },
                          },
                        },
                      },
                    ],
                    default: '',
                  },
                },
              },
            },
          },
        },
        quantitySort: {
          $let: {
            vars: {
              hit: {
                $first: {
                  $filter: {
                    input: '$quantity',
                    as: 'q',
                    cond: { $eq: ['$$q.warehouse', selectedWarehouse] },
                  },
                },
              },
            },
            in: { $ifNull: ['$$hit.count', 0] },
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
        purchasePrice: {
          $cond: [
            hasPurchasePricePermission,
            '$purchasePrice',
            '$$REMOVE',
          ],
        },
        purchaseCurrency: {
          $cond: [
            hasPurchasePricePermission,
            {
              id: '$purchaseCurrency._id',
              names: '$purchaseCurrency.names',
              symbols: '$purchaseCurrency.symbols',
            },
            '$$REMOVE',
          ],
        },
        barcodes: { id: 1, code: 1 },
        categories: { id: 1, names: 1 },
        unit: { id: '$unit._id', names: 1, symbols: 1 },
        quantitySort: 1,
        quantity: { count: 1, warehouse: 1, status: 1 },
        images: 1,
        productProperties: { id: 1, value: 1, data: { names: 1, symbols: 1, type: 1, isRequired: 1, showInTable: 1 }, optionData: { id: 1, names: 1, color: 1 } },
        productPropertiesSort: 1,
        productPropertiesGroup: { id: '$productPropertiesGroup._id', names: 1 },
        createdAt: 1,
        updatedAt: 1,
        id: '$_id',
      },
    },
    {
      $match: queryLast,
    },
    {
      $unset: ['productPropertiesSort'],
    },
    {
      $facet: {
        items: full
          ? []
          : [{ $skip: (current - 1) * pageSize }, { $limit: pageSize }],
        count: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await ProductModel.aggregate<AggregateResult<ProductDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateProductsRepoPayload) {
  return ProductModel.create(payload)
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

export async function findById(id: string, session?: ClientSession) {
  return ProductModel.findById(id, { session }).lean<ProductDB>().exec()
}

export async function addBarcodeToProducts(productIds: string[], barcodeId: string) {
  return ProductModel.findOneAndUpdate(
    { _id: { $in: productIds } },
    { $push: { barcodes: barcodeId } },
    { new: true, runValidators: true },
  ).exec()
}

export async function removeBarcodeFromProducts(barcodeId: string) {
  return ProductModel.findOneAndUpdate(
    { barcodes: { $in: [barcodeId] } },
    { $pull: { barcodes: { $in: [barcodeId] } } },
    { new: true, runValidators: true },
  ).exec()
}
