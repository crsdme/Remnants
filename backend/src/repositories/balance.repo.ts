import type { AggregateResult } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateBalancesPayload,
  GetBalancesPayload,
  GetBalancesRepoResult,
} from '@/types/'
import { BalanceModel } from '@/models'
import { buildQuery, unwrapAggregate } from '@/utils'

export async function list(payload: GetBalancesPayload): Promise<GetBalancesRepoResult> {
  const {
    current = 1,
    pageSize = 10,
  } = payload.pagination

  const {
    warehouses,
    cashregisters,
    date,
  } = payload.filters

  const query = buildQuery({
    filters: { warehouses, cashregisters, createdAt: date },
    rules: {
      warehouses: { type: 'array' },
      cashregisters: { type: 'array' },
      createdAt: { type: 'dateRange' },
    },
  })

  const pipeline: PipelineStage[] = [
    {
      $match: query,
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

  const raw = await BalanceModel.aggregate<AggregateResult<any>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateBalancesPayload) {
  return BalanceModel.create(payload)
}

export async function removeById(id: string) {
  return BalanceModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
