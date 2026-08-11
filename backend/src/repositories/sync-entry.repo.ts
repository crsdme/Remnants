import type { AggregateResult } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateSyncEntryRepoPayload,
  EditSyncEntryRepoPayload,
  GetSyncEntriesRepoPayload,
  GetSyncEntriesRepoResult,
  SyncEntryDTO,
} from '@/types/'
import { SyncEntryModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetSyncEntriesRepoPayload): Promise<GetSyncEntriesRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    sourceType,
    sourceId,
    siteId,
    externalId,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { sourceType, sourceId, siteId, externalId, createdAt, updatedAt },
    rules: {
      _id: { type: 'array' },
      sourceType: { type: 'exact' },
      sourceId: { type: 'exact' },
      siteId: { type: 'exact' },
      externalId: { type: 'exact' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
  })

  const sorters = buildSortQuery(payload.sorters, { createdAt: 1 })

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

  const raw = await SyncEntryModel.aggregate<AggregateResult<SyncEntryDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateSyncEntryRepoPayload) {
  return SyncEntryModel.create(payload)
}

export async function updateById(id: string, payload: EditSyncEntryRepoPayload) {
  return SyncEntryModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function findById(id: string) {
  return SyncEntryModel.findById(id).exec()
}

export async function removeById(id: string) {
  return SyncEntryModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
