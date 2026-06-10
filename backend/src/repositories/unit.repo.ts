import type { AggregateResult, UnitDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateOrderSourceRepoPayload,
  EditOrderSourceRepoPayload,
  GetUnitsRepoPayload,
  GetUnitsRepoResult,
} from '@/types/'
import { UnitModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetUnitsRepoPayload): Promise<GetUnitsRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    names,
    language,
    symbols,
    priority,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { names, symbols, priority, createdAt, updatedAt },
    rules: {
      _id: { type: 'array' },
      names: { type: 'string', langAware: true },
      symbols: { type: 'string', langAware: true },
      priority: { type: 'exact' },
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
        symbols: 1,
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

  const raw = await UnitModel.aggregate<AggregateResult<UnitDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateOrderSourceRepoPayload) {
  return UnitModel.create(payload)
}

export async function updateById(id: string, payload: EditOrderSourceRepoPayload) {
  return UnitModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function findById(id: string) {
  return UnitModel.findById(id).exec()
}

export async function removeById(id: string) {
  return UnitModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
