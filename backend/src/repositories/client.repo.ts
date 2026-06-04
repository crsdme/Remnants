import type { AggregateResult, ClientDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateClientsRepoPayload,
  EditClientsRepoPayload,
  GetClientsRepoPayload,
  GetClientsRepoResult,
} from '@/types/'
import { ClientModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetClientsRepoPayload): Promise<GetClientsRepoResult> {
  const {
    current = 1,
    pageSize = 10,
  } = payload.pagination

  const {
    ids,
    search,
    emails,
    phones,
    addresses,
    country,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { _id: ids, emails, phones, addresses, country, createdAt, updatedAt },
    rules: {
      _id: { type: 'array' },
      search: { type: 'string' },
      emails: { type: 'array' },
      phones: { type: 'array' },
      addresses: { type: 'array' },
      country: { type: 'string' },
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
          { field: `name` },
          { field: `middleName` },
          { field: `lastName` },
          { field: `emails`, isArray: true, isArrayPrimitive: true },
          { field: `phones`, isArray: true, isArrayPrimitive: true },
        ],
      },
    },
    removed: false,
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
      $match: queryLast,
    },
    {
      $facet: {
        clients: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await ClientModel.aggregate<AggregateResult<ClientDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateClientsRepoPayload) {
  return ClientModel.create(payload)
}

export async function updateById(id: string, payload: EditClientsRepoPayload) {
  return ClientModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function removeById(id: string) {
  return ClientModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
