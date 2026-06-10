import type { AggregateResult, InventoryDTO, InventoryItemDTO } from '@remnant/shared'
import type { ClientSession, PipelineStage } from 'mongoose'
import type {
  CreateInventoriesRepoPayload,
  CreateInventoryItemsRepoPayload,
  EditInventoryItemsRepoPayload,
  EditInventoryRepoPayload,
  GetInventoriesRepoPayload,
  GetInventoriesRepoResult,
  GetInventoryItemsRepoPayload,
  GetInventoryItemsRepoResult,
} from '@/types'
import { InventoryItemModel, InventoryModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list({ payload }: { payload: GetInventoriesRepoPayload }): Promise<GetInventoriesRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    seq,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: {
      seq,
      createdAt,
      updatedAt,
    },
    rules: {
      seq: { type: 'number' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
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
        seq: 1,
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

  const raw = await InventoryModel.aggregate<AggregateResult<InventoryDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function listItems({ payload }: { payload: GetInventoryItemsRepoPayload }): Promise<GetInventoryItemsRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    inventoryId,
  } = payload.filters

  const query = buildQuery({
    filters: {
      inventoryId,
    },
    rules: {
      inventoryId: { type: 'string' },
    },
  })

  // const projection: Record<string, unknown> = {
  //   _id: 0,
  //   id: '$_id',
  //   order: 1,
  //   product: 1,
  //   quantity: 1,
  //   price: 1,
  //   manualPrice: 1,
  //   basePrice: 1,
  //   currency: { id: '$currency._id', names: 1, symbols: 1 },
  //   discountAmount: 1,
  //   discountPercent: 1,
  //   transactionId: 1,
  //   createdAt: 1,
  // }

  // if (showFullData) {
  //   projection.profit = 1
  //   projection.exchangeRate = 1
  //   projection.purchasePrice = 1
  //   projection.purchaseCurrency = { id: '$purchaseCurrency._id', names: 1, symbols: 1 }
  // }

  const pipeline: PipelineStage[] = [
    {
      $match: query,
    },
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
    // {
    //   $project: projection,
    // },
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

  const raw = await InventoryItemModel.aggregate<AggregateResult<InventoryItemDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function create({ payload, session }: { payload: CreateInventoriesRepoPayload, session?: ClientSession }) {
  return InventoryModel.create([payload], { session })
}

export async function createItems({ payload, session }: { payload: CreateInventoryItemsRepoPayload[], session?: ClientSession }) {
  return InventoryItemModel.create(payload, { session })
}

export async function updateById({ id, payload, session }: { id: string, payload: EditInventoryRepoPayload, session?: ClientSession }) {
  return InventoryModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true, session },
  ).exec()
}

export async function updateOneItem({ payload, session }: { payload: EditInventoryItemsRepoPayload, session?: ClientSession }) {
  return InventoryItemModel.findOneAndUpdate(
    { _id: payload.id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true, session },
  ).exec()
}

export async function findById(id: string) {
  return InventoryModel.findById(id).exec()
}

export async function removeById(id: string, removedBy: string) {
  return InventoryModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true, removedBy, removedAt: new Date() } },
    { new: true, runValidators: true },
  ).exec()
}
