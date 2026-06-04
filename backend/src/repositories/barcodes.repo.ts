import type { AggregateResult, BarcodeDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type { CreateBarcodesRepoPayload, EditBarcodesRepoPayload, GetBarcodesRepoPayload } from '@/types'
import { STORAGE_URLS } from '@/config'
import { BarcodeModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetBarcodesRepoPayload): Promise<{ items: BarcodeDTO[], total: number, page: number, pageSize: number }> {
  const {
    current = 1,
    pageSize = 10,
  } = payload.pagination

  const {
    ids,
    codes,
    products,
    active,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: {
      _id: ids,
      code: codes,
      products,
      active,
      createdAt,
      updatedAt,
    },
    rules: {
      _id: { type: 'array' },
      code: { type: 'array' },
      products: { type: 'array' },
      active: { type: 'array' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
  })

  const sorters = buildSortQuery(payload.sorters, { code: 1 })

  const pipeline: PipelineStage[] = [
    { $match: query },
    { $unwind: '$products' },
    {
      $lookup: {
        from: 'products',
        localField: 'products._id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$product.productProperties', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'product-properties',
        localField: 'product.productProperties._id',
        foreignField: '_id',
        as: 'product.productProperties.data',
      },
    },
    {
      $lookup: {
        from: 'product-property-options',
        localField: 'product.productProperties.value',
        foreignField: '_id',
        as: 'product.productProperties.optionData',
      },
    },
    {
      $group: {
        _id: {
          barcode: '$_id',
          product: '$product._id',
        },
        doc: { $first: '$$ROOT' },
        productProperties: { $push: '$product.productProperties' },
      },
    },
    {
      $addFields: {
        'doc.product.productProperties': '$productProperties',
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
        localField: 'product.currency',
        foreignField: '_id',
        as: 'product.currency',
      },
    },
    {
      $addFields: {
        'product.currency': {
          $arrayElemAt: ['$product.currency', 0],
        },
      },
    },
    {
      $lookup: {
        from: 'currencies',
        localField: 'product.purchaseCurrency',
        foreignField: '_id',
        as: 'product.purchaseCurrency',
      },
    },
    { $addFields: { 'product.purchaseCurrency': { $arrayElemAt: ['$product.purchaseCurrency', 0] } } },
    {
      $lookup: {
        from: 'units',
        localField: 'product.unit',
        foreignField: '_id',
        as: 'product.unit',
      },
    },
    { $addFields: { 'product.unit': { $arrayElemAt: ['$product.unit', 0] } } },
    {
      $lookup: {
        from: 'categories',
        localField: 'product.categories',
        foreignField: '_id',
        as: 'product.categories',
      },
    },
    {
      $lookup: {
        from: 'product-property-groups',
        localField: 'product.productPropertiesGroup',
        foreignField: '_id',
        as: 'product.productPropertiesGroup',
      },
    },
    { $addFields: { 'product.productPropertiesGroup': { $arrayElemAt: ['$product.productPropertiesGroup', 0] } } },
    {
      $group: {
        _id: '$_id',
        code: { $first: '$code' },
        active: { $first: '$active' },
        removed: { $first: '$removed' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        products: {
          $push: {
            $mergeObjects: [
              '$product',
              { _id: '$products._id', quantity: '$products.quantity' },
            ],
          },
        },
      },
    },
    {
      $addFields: {
        products: {
          $map: {
            input: '$products',
            as: 'product',
            in: {
              id: '$$product._id',
              quantity: '$$product.quantity',
              names: '$$product.names',
              price: '$$product.price',
              currency: {
                id: '$$product.currency._id',
                names: '$$product.currency.names',
                symbols: '$$product.currency.symbols',
              },
              purchasePrice: '$$product.purchasePrice',
              purchaseCurrency: {
                id: '$$product.purchaseCurrency._id',
                names: '$$product.purchaseCurrency.names',
                symbols: '$$product.purchaseCurrency.symbols',
              },
              barcodes: '$$product.barcodes',
              categories: {
                $map: {
                  input: '$$product.categories',
                  as: 'cat',
                  in: { id: '$$cat._id', names: '$$cat.names' },
                },
              },
              unit: {
                id: '$$product.unit._id',
                names: '$$product.unit.names',
                symbols: '$$product.unit.symbols',
              },
              images: {
                $map: {
                  input: '$$product.images',
                  as: 'image',
                  in: {
                    id: '$$image._id',
                    path: { $concat: [STORAGE_URLS.productImages, '/', '$$image.filename'] },
                    filename: '$$image.filename',
                    name: '$$image.name',
                    type: '$$image.type',
                  },
                },
              },
              productProperties: {
                $map: {
                  input: '$$product.productProperties',
                  as: 'prop',
                  in: {
                    id: '$$prop._id',
                    value: '$$prop.value',
                    data: {
                      names: '$$prop.data.names',
                      type: '$$prop.data.type',
                      isRequired: '$$prop.data.isRequired',
                      showInTable: '$$prop.data.showInTable',
                    },
                    optionData: {
                      $map: {
                        input: '$$prop.optionData',
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
              productPropertiesGroup: {
                id: '$$product.productPropertiesGroup._id',
                names: '$$product.productPropertiesGroup.names',
              },
              createdAt: '$$product.createdAt',
              updatedAt: '$$product.updatedAt',
            },
          },
        },
      },
    },
    { $sort: sorters },
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

  const raw = await BarcodeModel.aggregate<AggregateResult<BarcodeDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateBarcodesRepoPayload) {
  return BarcodeModel.create(payload)
}

export async function updateById(id: string, payload: EditBarcodesRepoPayload) {
  return BarcodeModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function removeById(id: string) {
  return BarcodeModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
