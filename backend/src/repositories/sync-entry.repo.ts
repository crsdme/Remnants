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
    externalIds,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { sourceType, sourceId, siteId, externalIds, createdAt, updatedAt },
    rules: {
      _id: { type: 'array' },
      sourceType: { type: 'exact' },
      sourceId: { type: 'exact' },
      siteId: { type: 'exact' },
      externalIds: { type: 'exact' },
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
        sourceType: 1,
        sourceId: 1,
        siteId: 1,
        externalIds: { $ifNull: ['$externalIds', []] },
        status: 1,
        syncedAt: 1,
        lastError: 1,
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

export async function findLink(siteId: string, sourceType: string, sourceId: string) {
  return SyncEntryModel.findOne({ siteId, sourceType, sourceId }).exec()
}

export async function findLinks(siteId: string, sourceType: string, sourceIds: string[]) {
  if (sourceIds.length === 0)
    return []
  return SyncEntryModel.find({ siteId, sourceType, sourceId: { $in: sourceIds } }).exec()
}

export async function findLinksByType(siteId: string, sourceType: string) {
  return SyncEntryModel.find({ siteId, sourceType }).exec()
}

export type SyncEntrySourceType = 'product' | 'category' | 'attribute' | 'language'

export async function upsertLink(payload: {
  siteId: string
  sourceType: SyncEntrySourceType
  sourceId: string
  externalIds?: string[]
  status: 'pending' | 'synced' | 'error'
  lastError?: string | null
  syncedAt?: Date | null
}) {
  const $set: Record<string, unknown> = {
    status: payload.status,
  }

  if (payload.externalIds !== undefined)
    $set.externalIds = payload.externalIds.filter(id => id !== '')
  if (payload.lastError !== undefined)
    $set.lastError = payload.lastError
  if (payload.syncedAt !== undefined)
    $set.syncedAt = payload.syncedAt

  return SyncEntryModel.findOneAndUpdate(
    {
      siteId: payload.siteId,
      sourceType: payload.sourceType,
      sourceId: payload.sourceId,
    },
    {
      $set,
      $setOnInsert: {
        siteId: payload.siteId,
        sourceType: payload.sourceType,
        sourceId: payload.sourceId,
      },
    },
    { new: true, upsert: true, runValidators: true },
  ).exec()
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
