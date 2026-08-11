import type { AggregateResult, AutomationDTO } from '@remnant/shared'
import type { ClientSession, PipelineStage } from 'mongoose'
import type {
  AutomationDB,
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
      $project: {
        _id: 0,
        id: '$_id',
        name: 1,
        trigger: 1,
        conditions: 1,
        actions: 1,
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

export async function listActiveByTriggerType({
  type,
  session,
}: {
  type: string
  session?: ClientSession
}): Promise<AutomationDB[]> {
  return AutomationModel.find({
    'trigger.type': type,
    'active': true,
    'removed': { $ne: true },
  })
    .session(session ?? null)
    .lean()
    .exec() as Promise<AutomationDB[]>
}
