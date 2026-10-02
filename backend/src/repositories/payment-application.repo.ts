import type { AggregateResult } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreatePaymentApplicationRepoPayload,
  GetPaymentApplicationsPayload,
  GetPaymentApplicationsRepoResult,
  PaymentApplicationDB,
  PaymentApplicationListRow,
} from '@/types'
import { PaymentApplicationModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

interface SumRow {
  sourceId: string
  currencyId: string
  minorAmount: number
}

async function sumBy(field: 'partyId' | 'documentId' | 'moneyTransactionId', ids: string[]): Promise<SumRow[]> {
  if (ids.length === 0)
    return []

  return PaymentApplicationModel.aggregate<SumRow>([
    {
      $match: {
        [field]: { $in: ids },
        cancelled: { $ne: true },
      },
    },
    {
      $group: {
        _id: { sourceId: `$${field}`, currencyId: '$currencyId' },
        minorAmount: { $sum: '$minorAmount' },
      },
    },
    {
      $project: {
        _id: 0,
        sourceId: '$_id.sourceId',
        currencyId: '$_id.currencyId',
        minorAmount: 1,
      },
    },
  ]).exec()
}

export async function sumActiveMinorsByPartyIds(partyIds: string[]): Promise<SumRow[]> {
  return sumBy('partyId', partyIds)
}

export async function sumActiveMinorsByDocumentIds(documentIds: string[]): Promise<SumRow[]> {
  return sumBy('documentId', documentIds)
}

export async function sumActiveMinorsByMoneyTransactionIds(moneyTransactionIds: string[]): Promise<Map<string, number>> {
  const rows = await sumBy('moneyTransactionId', moneyTransactionIds)
  return new Map(rows.map(row => [String(row.sourceId), Number(row.minorAmount) || 0]))
}

export async function findById(id: string): Promise<PaymentApplicationDB | null> {
  return PaymentApplicationModel.findById(id).lean().exec() as Promise<PaymentApplicationDB | null>
}

export async function createOne(payload: CreatePaymentApplicationRepoPayload, session?: import('mongoose').ClientSession) {
  const [created] = await PaymentApplicationModel.create([{
    ...payload,
    cancelled: payload.cancelled ?? false,
  }], session ? { session } : undefined)
  return created
}

export async function cancelById({
  id,
  cancelledBy,
}: {
  id: string
  cancelledBy: string
}) {
  return PaymentApplicationModel.findByIdAndUpdate(
    id,
    {
      $set: {
        cancelled: true,
        cancelledBy,
        cancelledAt: new Date(),
      },
    },
    { new: true },
  ).lean().exec()
}

export async function listActiveByDocumentId(documentId: string): Promise<PaymentApplicationDB[]> {
  return PaymentApplicationModel.find({
    documentId,
    cancelled: { $ne: true },
  }).sort({ createdAt: -1 }).lean().exec() as Promise<PaymentApplicationDB[]>
}

export async function list(payload: GetPaymentApplicationsPayload): Promise<GetPaymentApplicationsRepoResult> {
  const { current, pageSize, full = false } = payload.pagination
  const { partyType, partyId, documentType, documentId, moneyTransactionId } = payload.filters

  const query = buildQuery({
    filters: { partyType, partyId, documentType, documentId, moneyTransactionId },
    rules: {
      partyType: { type: 'exact' },
      partyId: { type: 'exact' },
      documentType: { type: 'exact' },
      documentId: { type: 'exact' },
      moneyTransactionId: { type: 'exact' },
    },
    removed: false,
  })

  const sorters = buildSortQuery(payload.sorters, { createdAt: 1 })

  const pipeline: PipelineStage[] = [
    { $match: query },
    { $sort: sorters },
    {
      $lookup: {
        from: 'currencies',
        localField: 'currencyId',
        foreignField: '_id',
        as: 'currency',
      },
    },
    {
      $addFields: {
        currency: { $arrayElemAt: ['$currency', 0] },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        seq: 1,
        partyType: 1,
        partyId: 1,
        documentType: 1,
        documentId: 1,
        moneyTransactionId: 1,
        minorAmount: 1,
        comment: 1,
        cancelled: 1,
        cancelledBy: 1,
        cancelledAt: 1,
        createdBy: 1,
        createdAt: 1,
        updatedAt: 1,
        currency: {
          id: '$currency._id',
          names: '$currency.names',
          symbols: '$currency.symbols',
          scale: { $ifNull: ['$currency.scale', 2] },
        },
      },
    },
    {
      $facet: {
        items: full
          ? []
          : [{ $skip: (current - 1) * pageSize }, { $limit: pageSize }],
        count: [{ $count: 'count' }],
      },
    },
  ]

  const raw = await PaymentApplicationModel.aggregate<AggregateResult<PaymentApplicationListRow>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize: full ? Math.max(total, pageSize) : pageSize }
}
