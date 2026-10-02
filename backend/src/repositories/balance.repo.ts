import type { AggregateResult } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateBalanceRepoPayload,
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

  const { date } = payload.filters

  const query = buildQuery({
    filters: { createdAt: date },
    rules: {
      createdAt: { type: 'dateRange' },
    },
    removed: false,
  })

  const pipeline: PipelineStage[] = [
    { $match: query },
    { $sort: { createdAt: -1, _id: -1 } },
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

  const raw = await BalanceModel.aggregate<AggregateResult<Record<string, unknown>>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return {
    items: items.map(row => ({
      _id: String(row._id),
      seq: Number(row.seq ?? 0),
      totalBalances: (row.totalBalances as never) ?? [],
      cashregisterBalance: (row.cashregisterBalance as never) ?? [],
      warehouseBalance: (row.warehouseBalance as never) ?? [],
      transitBalance: (row.transitBalance as never) ?? [],
      orderedNotReceivedBalance: (row.orderedNotReceivedBalance as never) ?? [],
      prepaidBalance: (row.prepaidBalance as never) ?? [],
      receivableBalance: (row.receivableBalance as never) ?? [],
      supplierDebtBalance: (row.supplierDebtBalance as never) ?? [],
      comment: String(row.comment ?? ''),
      createdBy: String(row.createdBy ?? ''),
      removed: Boolean(row.removed),
      removedBy: row.removedBy != null ? String(row.removedBy) : null,
      createdAt: row.createdAt as Date,
      updatedAt: row.updatedAt as Date,
    })),
    total,
    page: current,
    pageSize,
  }
}

export async function createOne(payload: CreateBalanceRepoPayload) {
  const [created] = await BalanceModel.create([payload])
  return created
}

export async function removeById(id: string, removedBy?: string) {
  return BalanceModel.findOneAndUpdate(
    { _id: id, removed: { $ne: true } },
    { $set: { removed: true, ...(removedBy !== undefined ? { removedBy } : {}) } },
    { new: true, runValidators: true },
  ).exec()
}
