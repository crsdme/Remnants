import type { AggregateResult, ExpenseCategoryDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateExpenseCategoriesRepoPayload,
  EditExpenseCategoriesRepoPayload,
  GetExpenseCategoriesRepoPayload,
  GetExpenseCategoriesRepoResult,
} from '@/types/'
import { ExpenseCategoryModel } from '@/models'
import { applyScopeIdsToQuery, buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(
  payload: GetExpenseCategoriesRepoPayload,
  options: { scopeIds?: string[] | null } = {},
): Promise<GetExpenseCategoriesRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    ids,
    names,
    color,
    priority,
    comment,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { _id: ids, names, color, priority, comment, createdAt, updatedAt },
    rules: {
      _id: { type: 'array' },
      names: { type: 'string', langAware: true },
      color: { type: 'exact' },
      priority: { type: 'exact' },
      comment: { type: 'exact' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
  })

  applyScopeIdsToQuery(query, options.scopeIds)

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
        color: 1,
        priority: 1,
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

  const raw = await ExpenseCategoryModel.aggregate<AggregateResult<ExpenseCategoryDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateExpenseCategoriesRepoPayload) {
  return ExpenseCategoryModel.create(payload)
}

export async function updateById(id: string, payload: EditExpenseCategoriesRepoPayload) {
  return ExpenseCategoryModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function removeById(id: string) {
  return ExpenseCategoryModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
