import type { AggregateResult, QuantityDTO } from '@remnant/shared'
import type { ClientSession, FilterQuery, PipelineStage, UpdateQuery } from 'mongoose'
import type {
  CreateQuantityRepoPayload,
  EditQuantityRepoPayload,
  GetQuantitiesRepoPayload,
  GetQuantitiesRepoResult,
  QuantityDB,
} from '@/types/'
import { QuantityModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetQuantitiesRepoPayload): Promise<GetQuantitiesRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    productId,
    warehouse,
    status,
    count,
  } = payload.filters

  const query = buildQuery({
    filters: { productId, warehouse, status, count },
    rules: {
      productId: { type: 'exact' },
      warehouse: { type: 'exact' },
      status: { type: 'exact' },
      count: { type: 'exact' },
    },
  })

  const sorters = buildSortQuery(payload.sorters, { count: 1 })

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
        count: 1,
        productId: 1,
        warehouse: 1,
        status: 1,
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

  const raw = await QuantityModel.aggregate<AggregateResult<QuantityDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne({ payload, session }: { payload: CreateQuantityRepoPayload, session?: ClientSession }) {
  return QuantityModel.create([payload], { session })
}

export async function updateById({ id, payload, session }: { id: string, payload: EditQuantityRepoPayload, session?: ClientSession }) {
  return QuantityModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true, session },
  ).exec()
}

export async function findById(id: string) {
  return QuantityModel.findById(id).exec()
}

export async function findAndUpdate({ query, payload, session }: { query: FilterQuery<QuantityDB>, payload: UpdateQuery<QuantityDB>, session?: ClientSession }) {
  return QuantityModel.findOneAndUpdate(
    query,
    payload,
    { new: true, runValidators: true, session },
  ).exec()
}

export async function removeById(id: string) {
  return QuantityModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
