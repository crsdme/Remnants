import type { AggregateResult, OrderPaymentDTO } from '@remnant/shared'
import type { ClientSession, PipelineStage } from 'mongoose'
import type {
  CreateOrderPaymentsRepoPayload,
  EditOrderPaymentsRepoPayload,
  GetOrderPaymentsRepoPayload,
  GetOrderPaymentsRepoResult,
  OrderPaymentDB,
  OrderPaymentDBPopulated,
} from '@/types/'
import { OrderPaymentModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

export async function list({ payload }: { payload: GetOrderPaymentsRepoPayload }): Promise<GetOrderPaymentsRepoResult> {
  const {
    current,
    pageSize,
  } = payload.pagination

  const {
    order,
    cashregister,
    cashregisterAccount,
    currency,
    paymentStatus,
    paymentDate,
    transaction,
    createdBy,
    removedBy,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: {
      order,
      cashregister,
      cashregisterAccount,
      currency,
      paymentStatus,
      paymentDate,
      transaction,
      createdBy,
      removedBy,
      createdAt,
      updatedAt,
    },
    rules: {
      _id: { type: 'array' },
      order: { type: 'array' },
      cashregister: { type: 'string' },
      cashregisterAccount: { type: 'string' },
      currency: { type: 'string' },
      paymentStatus: { type: 'string' },
      paymentDate: { type: 'dateRange' },
      transaction: { type: 'string' },
      createdBy: { type: 'string' },
      removedBy: { type: 'string' },
      removed: { type: 'exact' },
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
      $lookup: {
        from: 'currencies',
        localField: 'currency',
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
        order: 1,
        cashregister: 1,
        cashregisterAccount: 1,
        currency: { id: '$currency._id', names: 1, symbols: 1 },
        amount: 1,
        paymentStatus: 1,
        paymentDate: 1,
        transaction: 1,
        comment: 1,
        createdAt: 1,
        updatedAt: 1,
        createdBy: 1,
        removedBy: 1,
        removed: 1,
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

  const raw = await OrderPaymentModel.aggregate<AggregateResult<OrderPaymentDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function getById({ id }: { id: string }): Promise<OrderPaymentDBPopulated | null> {
  return OrderPaymentModel
    .findById(id)
    .populate({ path: 'currency', select: 'names symbols' })
    .lean<OrderPaymentDBPopulated>()
    .exec()
}

export async function createOne({ payload, session }: { payload: CreateOrderPaymentsRepoPayload, session?: ClientSession }): Promise<OrderPaymentDB[]> {
  return OrderPaymentModel.create([payload], { session })
}

export async function updateById({ id, payload, session }: { id: string, payload: EditOrderPaymentsRepoPayload, session?: ClientSession }) {
  return OrderPaymentModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true, session },
  ).exec()
}

export async function removeById({ id, session }: { id: string, session?: ClientSession }) {
  return OrderPaymentModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true, session },
  ).exec()
}
