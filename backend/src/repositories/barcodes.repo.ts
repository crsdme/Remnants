import type { AggregateResult, BarcodeDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type { CreateBarcodesRepoPayload, EditBarcodesRepoPayload, GetBarcodeByCodeRepoResult, GetBarcodesRepoPayload } from '@/types'
import { BarcodeModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'
import { productPopulatedStages } from './products.repo'

export async function list(payload: GetBarcodesRepoPayload): Promise<GetBarcodeByCodeRepoResult> {
  const {
    current,
    pageSize,
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
    ...productPopulatedStages({
      productIdPath: '$products._id',
      as: 'productsData',
      many: true,
    }),
    { $sort: sorters },
    {
      $addFields: {
        products: {
          $map: {
            input: { $range: [0, { $size: '$productsData' }] },
            as: 'idx',
            in: {
              $mergeObjects: [
                { $arrayElemAt: ['$productsData', '$$idx'] },
                {
                  unitsPerScan: {
                    $let: {
                      vars: {
                        prod: { $arrayElemAt: ['$products', '$$idx'] },
                      },
                      in: '$$prod.lineQuantity',
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        products: 1,
        // productsData: 0,
        code: 1,
        active: 1,
        removed: 1,
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
