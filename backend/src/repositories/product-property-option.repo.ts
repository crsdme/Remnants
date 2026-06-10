import type { AggregateResult, ProductPropertyOptionDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateProductPropertyOptionRepoPayload,
  EditProductPropertyOptionRepoPayload,
  GetProductPropertyOptionsRepoPayload,
  ProductPropertyOptionDB,
} from '@/types/'
import { ProductPropertyOptionModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetProductPropertyOptionsRepoPayload): Promise<{ items: ProductPropertyOptionDTO[], total: number, page: number, pageSize: number }> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    ids,
    names,
    language,
    priority,
    active,
    productProperty,
    createdAt,
  } = payload.filters

  const query = buildQuery({
    filters: { _id: ids, names, priority, active, productProperty, createdAt },
    rules: {
      _id: { type: 'array' },
      names: { type: 'string', langAware: true },
      active: { type: 'array' },
      priority: { type: 'exact' },
      productProperty: { type: 'exact' },
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
      $project: {
        _id: 0,
        id: '$_id',
        names: 1,
        priority: 1,
        active: 1,
        color: 1,
        productProperty: 1,
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

  const raw = await ProductPropertyOptionModel.aggregate<AggregateResult<ProductPropertyOptionDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateProductPropertyOptionRepoPayload) {
  return ProductPropertyOptionModel.create(payload)
}

export async function updateById(id: string, payload: EditProductPropertyOptionRepoPayload) {
  return ProductPropertyOptionModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function findById(id: string) {
  return ProductPropertyOptionModel.findById(id).lean<ProductPropertyOptionDB>().exec()
}

export async function removeById(id: string) {
  return ProductPropertyOptionModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).lean<ProductPropertyOptionDB>().exec()
}
