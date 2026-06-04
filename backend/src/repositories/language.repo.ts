import type { AggregateResult, LanguageDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateLanguagesRepoPayload,
  EditLanguagesRepoPayload,
  GetLanguagesRepoPayload,
  GetLanguagesRepoResult,
} from '@/types/'
import { LanguageModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetLanguagesRepoPayload): Promise<GetLanguagesRepoResult> {
  const {
    current = 1,
    pageSize = 10,
  } = payload.pagination

  const {
    name,
    code,
    active,
    priority,
    main,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { name, code, active, priority, main, createdAt, updatedAt },
    rules: {
      name: { type: 'string' },
      code: { type: 'string' },
      active: { type: 'array' },
      priority: { type: 'exact' },
      main: { type: 'array' },
    },
  })

  const sorters = buildSortQuery(payload.sorters, { priority: 1 })

  const pipeline: PipelineStage[] = [
    { $match: query },
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

  const raw = await LanguageModel.aggregate<AggregateResult<LanguageDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateLanguagesRepoPayload) {
  return LanguageModel.create(payload)
}

export async function updateById(id: string, payload: EditLanguagesRepoPayload) {
  return LanguageModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function removeById(id: string) {
  return LanguageModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
