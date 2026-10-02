import type { AggregateResult, SupplierDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateSuppliersRepoPayload,
  EditSuppliersRepoPayload,
  GetSuppliersRepoPayload,
  GetSuppliersRepoResult,
} from '@/types/'
import { SupplierModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetSuppliersRepoPayload): Promise<GetSuppliersRepoResult> {
  const {
    current = 1,
    pageSize = 10,
    full = false,
  } = payload.pagination

  const {
    ids,
    seq,
    search,
    emails,
    phones,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { _id: ids, seq, emails, phones, createdAt, updatedAt },
    rules: {
      _id: { type: 'array' },
      seq: { type: 'array' },
      emails: { type: 'array' },
      phones: { type: 'array' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
  })

  const queryLast = buildQuery({
    filters: { search },
    rules: {
      search: {
        type: 'multiFieldSearch',
        multiFields: [
          { field: 'name' },
          { field: 'emails', isArray: true, isArrayPrimitive: true },
          { field: 'phones', isArray: true, isArrayPrimitive: true },
        ],
      },
    },
    removed: false,
  })

  const sorters = buildSortQuery(payload.sorters, { createdAt: 1 })

  const pipeline: PipelineStage[] = [
    { $match: query },
    { $sort: sorters },
    { $match: queryLast },
    {
      $project: {
        _id: 0,
        id: '$_id',
        seq: { $ifNull: ['$seq', 0] },
        name: 1,
        emails: { $ifNull: ['$emails', []] },
        phones: { $ifNull: ['$phones', []] },
        socials: { $ifNull: ['$socials', []] },
        comment: 1,
        removed: { $ifNull: ['$removed', false] },
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $facet: {
        items: full
          ? []
          : [
              { $skip: (current - 1) * pageSize },
              { $limit: pageSize },
            ],
        count: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await SupplierModel.aggregate<AggregateResult<SupplierDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize: full ? Math.max(total, pageSize) : pageSize }
}

export async function createOne(payload: CreateSuppliersRepoPayload) {
  return SupplierModel.create(payload)
}

export async function updateById(id: string, payload: EditSuppliersRepoPayload) {
  return SupplierModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function findById(id: string) {
  return SupplierModel.findById(id).exec()
}

export async function removeById(id: string) {
  return SupplierModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
