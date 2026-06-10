import type { AggregateResult, SettingDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateSettingRepoPayload,
  EditSettingRepoPayload,
  GetSettingsRepoPayload,
  GetSettingsRepoResult,
} from '@/types/'
import { SettingModel } from '@/models'
import { buildQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetSettingsRepoPayload): Promise<GetSettingsRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    key,
    scope,
    isPublic,
  } = payload.filters

  const query = buildQuery({
    filters: { key, scope, isPublic },
    rules: {
      key: { type: 'string' },
      scope: { type: 'string' },
      isPublic: { type: 'exact' },
    },
  })

  const pipeline: PipelineStage[] = [
    {
      $match: query,
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        key: 1,
        scope: 1,
        isPublic: 1,
        description: 1,
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

  const raw = await SettingModel.aggregate<AggregateResult<SettingDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateSettingRepoPayload) {
  return SettingModel.create(payload)
}

export async function updateById(id: string, payload: EditSettingRepoPayload) {
  return SettingModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function findById(id: string) {
  return SettingModel.findById(id).exec()
}

export async function removeById(id: string) {
  return SettingModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
