import type { AggregateResult, AutomationDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateAutomationsRepoPayload,
  EditAutomationsRepoPayload,
  GetAutomationsRepoPayload,
  GetAutomationsRepoResult,
} from '@/types'
import { AutomationModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetAutomationsRepoPayload): Promise<GetAutomationsRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    trigger,
    active,
    conditions,
    actions,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { trigger, conditions, actions, active, createdAt, updatedAt },
    rules: {
      trigger: { type: 'string', langAware: true },
      conditions: { type: 'array' },
      actions: { type: 'array' },
      active: { type: 'array' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
  })

  const sorters = buildSortQuery(payload.sorters, { priority: 1 })

  const pipeline: PipelineStage[] = [
    { $match: query },
    { $sort: sorters },
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $facet: {
        items: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        count: [{ $count: 'count' }],
      },
    },
  ]

  const raw = await AutomationModel.aggregate<AggregateResult<AutomationDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateAutomationsRepoPayload) {
  return AutomationModel.create(payload)
}

export async function updateById(id: string, payload: EditAutomationsRepoPayload) {
  return AutomationModel.findOneAndUpdate(
    { _id: id },
    { $set: payload },
    { new: true, runValidators: true },
  ).exec()
}

export async function removeById(id: string) {
  return AutomationModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
