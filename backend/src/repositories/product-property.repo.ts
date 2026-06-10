import type { AggregateResult, ProductPropertyDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateProductPropertyRepoPayload,
  EditProductPropertyRepoPayload,
  GetProductPropertiesRepoPayload,
  ProductPropertyDB,
} from '@/types/'
import { ProductPropertyModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetProductPropertiesRepoPayload): Promise<{ items: ProductPropertyDTO[], total: number, page: number, pageSize: number }> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    ids,
    names,
    language,
    symbols,
    options,
    type,
    priority,
    active,
    showInTable,
    showInStatistics,
    createdAt,
  } = payload.filters

  const query = buildQuery({
    filters: { _id: ids, names, symbols, options, type, priority, active, showInTable, showInStatistics, createdAt },
    rules: {
      _id: { type: 'array' },
      names: { type: 'string', langAware: true },
      symbols: { type: 'string', langAware: true },
      active: { type: 'array' },
      options: { type: 'array' },
      type: { type: 'exact' },
      priority: { type: 'exact' },
      showInTable: { type: 'exact' },
      showInStatistics: { type: 'exact' },
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
        seq: 1,
        names: 1,
        symbols: 1,
        options: 1,
        type: 1,
        isRequired: 1,
        showInTable: 1,
        showInStatistics: 1,
        priority: 1,
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

  const raw = await ProductPropertyModel.aggregate<AggregateResult<ProductPropertyDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateProductPropertyRepoPayload) {
  return ProductPropertyModel.create(payload)
}

export async function updateById(id: string, payload: EditProductPropertyRepoPayload) {
  return ProductPropertyModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function findById(id: string) {
  return ProductPropertyModel.findById(id).lean<ProductPropertyDB>().exec()
}

export async function removeById(id: string) {
  return ProductPropertyModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).lean<ProductPropertyDB>().exec()
}

export async function updateOptions(id: string, payload: unknown) {
  return ProductPropertyModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}
