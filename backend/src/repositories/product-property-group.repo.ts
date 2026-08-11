import type { AggregateResult, ProductPropertyGroupPopulatedDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateProductPropertyGroupRepoPayload,
  EditProductPropertyGroupRepoPayload,
  GetProductPropertyGroupsRepoPayload,
  GetProductPropertyGroupsRepoResult,
  ProductPropertyGroupDB,
} from '@/types/'
import { ProductPropertyGroupModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetProductPropertyGroupsRepoPayload): Promise<GetProductPropertyGroupsRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    names,
    language,
    productPropertyIds,
    active,
    priority,
    createdAt,
  } = payload.filters

  const query = buildQuery({
    filters: { names, active, priority, productPropertyIds, createdAt },
    rules: {
      names: { type: 'string', langAware: true },
      active: { type: 'array' },
      priority: { type: 'exact' },
      productPropertyIds: { type: 'array' },
      createdAt: { type: 'dateRange' },
    },
    language,
  })

  const sorters = buildSortQuery(payload.sorters, { priority: 1 })

  const pipeline: PipelineStage[] = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $lookup: {
        from: 'product-properties',
        localField: 'productPropertyIds',
        foreignField: '_id',
        as: 'productProperties',
      },
    },
    {
      $set: {
        productProperties: {
          $sortArray: {
            input: '$productProperties',
            sortBy: { priority: 1 },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        seq: 1,
        names: 1,
        priority: 1,
        productProperties: {
          $map: {
            input: '$productProperties',
            as: 'pp',
            in: {
              id: '$$pp._id',
              names: '$$pp.names',
              symbols: { $ifNull: ['$$pp.symbols', {}] },
              optionIds: { $ifNull: ['$$pp.optionIds', []] },
              priority: '$$pp.priority',
              type: '$$pp.type',
              isRequired: '$$pp.isRequired',
              showInTable: '$$pp.showInTable',
              showInStatistics: '$$pp.showInStatistics',
              active: '$$pp.active',
              createdAt: '$$pp.createdAt',
              updatedAt: '$$pp.updatedAt',
            },
          },
        },
        active: 1,
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

  const raw = await ProductPropertyGroupModel.aggregate<AggregateResult<ProductPropertyGroupPopulatedDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateProductPropertyGroupRepoPayload) {
  return ProductPropertyGroupModel.create(payload)
}

export async function updateById(id: string, payload: EditProductPropertyGroupRepoPayload) {
  return ProductPropertyGroupModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function findById(id: string) {
  return ProductPropertyGroupModel.findById(id).lean<ProductPropertyGroupDB>().exec()
}

export async function removeById(id: string) {
  return ProductPropertyGroupModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).lean<ProductPropertyGroupDB>().exec()
}
