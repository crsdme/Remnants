import type { AggregateResult, ProductStockStatusDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateProductStockStatusRepoPayload,
  EditProductStockStatusRepoPayload,
  GetProductStockStatusesRepoPayload,
  GetProductStockStatusesRepoResult,
} from '@/types/'
import { ProductStockStatusModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(
  payload: GetProductStockStatusesRepoPayload,
): Promise<GetProductStockStatusesRepoResult> {
  const {
    current,
    pageSize,
    full,
  } = payload.pagination

  const {
    ids,
    names,
    language,
    color,
    priority,
    active,
    isDefault,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { _id: ids, names, color, priority, createdAt, updatedAt, active, isDefault },
    rules: {
      _id: { type: 'array' },
      names: { type: 'string', langAware: true },
      color: { type: 'string' },
      priority: { type: 'exact' },
      active: { type: 'exact' },
      isDefault: { type: 'exact' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
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
        color: 1,
        priority: 1,
        active: 1,
        isDefault: 1,
        conditions: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $facet: {
        items: [
          ...(full
            ? []
            : [
                { $skip: (current - 1) * pageSize },
                { $limit: pageSize },
              ]),
        ],
        count: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await ProductStockStatusModel.aggregate<AggregateResult<ProductStockStatusDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateProductStockStatusRepoPayload) {
  return ProductStockStatusModel.create(payload)
}

export async function updateById(id: string, payload: EditProductStockStatusRepoPayload) {
  return ProductStockStatusModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function findById(id: string) {
  return ProductStockStatusModel.findById(id).exec()
}

export async function removeById(id: string) {
  return ProductStockStatusModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}

export async function unsetDefaults(excludeId?: string) {
  const filter: Record<string, unknown> = { isDefault: true, removed: false }
  if (excludeId)
    filter._id = { $ne: excludeId }

  return ProductStockStatusModel.updateMany(
    filter,
    { $set: { isDefault: false } },
  ).exec()
}

export async function listActive() {
  return ProductStockStatusModel
    .find({ removed: false, active: true })
    .sort({ priority: 1 })
    .exec()
}
