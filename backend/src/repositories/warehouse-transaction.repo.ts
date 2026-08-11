import type { AggregateResult, WarehouseTransactionDTO } from '@remnant/shared'
import type { ClientSession, FilterQuery, PipelineStage } from 'mongoose'
import type {
  CreateWarehouseTransactionItemsRepoPayload,
  CreateWarehouseTransactionRepoPayload,
  EditWarehouseTransactionItemRepoPayload,
  EditWarehouseTransactionRepoPayload,
  GetWarehouseTransactionsItemsRepoPayload,
  GetWarehouseTransactionsItemsRepoResult,
  GetWarehouseTransactionsRepoPayload,
  GetWarehouseTransactionsRepoResult,
  WarehouseTransactionDB,
  WarehouseTransactionItemDB,
  WarehouseTransactionItemDBPopulated,
} from '@/types/'
import { WarehouseTransactionItemModel, WarehouseTransactionModel } from '@/models'
import { applyScopeIdsToAnyOfFields, buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(
  payload: GetWarehouseTransactionsRepoPayload,
  options: { warehouseIds?: string[] | null } = {},
): Promise<GetWarehouseTransactionsRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    seq,
    id,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { seq, _id: id, createdAt, updatedAt },
    rules: {
      seq: { type: 'number' },
      _id: { type: 'exact' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
  })

  applyScopeIdsToAnyOfFields(query, options.warehouseIds, ['fromWarehouseId', 'toWarehouseId'])

  const sorters = buildSortQuery(payload.sorters, { createdAt: 1 })

  const pipeline: PipelineStage[] = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $lookup: {
        from: 'warehouses',
        localField: 'fromWarehouseId',
        foreignField: '_id',
        as: 'fromWarehouse',
      },
    },
    {
      $lookup: {
        from: 'warehouses',
        localField: 'toWarehouseId',
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
        seq: 1,
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
        requiresReceiving: { $ifNull: ['$requiresReceiving', true] },
        status: 1,
        accepted: { $ifNull: ['$accepted', false] },
        acceptedBy: 1,
        createdBy: 1,
        removedBy: 1,
        comment: { $ifNull: ['$comment', ''] },
        acceptedAt: 1,
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

  const raw = await WarehouseTransactionModel.aggregate<AggregateResult<WarehouseTransactionDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function listItems(payload: GetWarehouseTransactionsItemsRepoPayload): Promise<GetWarehouseTransactionsItemsRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    transactionId,
  } = payload.filters

  const query = buildQuery({
    filters: { transactionId },
    rules: {
      transactionId: { type: 'exact' },
    },
    removed: false,
  })

  const sorters = buildSortQuery({}, { _id: 1 })

  const pipeline: PipelineStage[] = [
    {
      $match: query,
    },
    {
      $sort: sorters,
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
              minorPrice: 1,
              currency: { id: '$currency._id', names: 1, symbols: 1, scale: '$currency.scale' },
              minorPurchasePrice: 1,
              purchaseCurrency: { id: '$purchaseCurrency._id', names: 1, symbols: 1, scale: '$purchaseCurrency.scale' },
              barcodes: { id: 1, code: 1 },
              categories: { id: 1, names: 1 },
              unit: { id: '$unit._id', names: 1, symbols: 1 },
              quantity: { count: 1, warehouseId: 1, status: 1 },
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
        productId: {
          $first: '$product.id',
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        product: 1,
        productId: 1,
        quantity: 1,
        transactionId: 1,
        createdAt: 1,
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

  const raw = await WarehouseTransactionItemModel.aggregate<AggregateResult<WarehouseTransactionItemDBPopulated>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateWarehouseTransactionRepoPayload) {
  return WarehouseTransactionModel.create(payload)
}

export async function createItems(payload: CreateWarehouseTransactionItemsRepoPayload[], session?: ClientSession) {
  return WarehouseTransactionItemModel.create(payload, { session })
}

export async function updateById(id: string, payload: EditWarehouseTransactionRepoPayload) {
  return WarehouseTransactionModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function updateItem({ query, payload }: { query: FilterQuery<WarehouseTransactionItemDB>, payload: EditWarehouseTransactionItemRepoPayload }) {
  return WarehouseTransactionItemModel.findOneAndUpdate(
    query,
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function findById(id: string) {
  return WarehouseTransactionModel.findById(id).exec()
}

export async function findOne(query: FilterQuery<WarehouseTransactionDB>) {
  return WarehouseTransactionModel.findOne(query).exec()
}

export async function removeById(id: string, userId: string) {
  return WarehouseTransactionModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true, removedBy: userId, removedAt: new Date() } },
    { new: true, runValidators: true },
  ).exec()
}
