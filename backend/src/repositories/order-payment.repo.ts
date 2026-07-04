import type { AggregateResult } from '@remnant/shared'
import type { ClientSession, PipelineStage } from 'mongoose'
import type {
  CreateOrderPaymentsRepoPayload,
  EditOrderPaymentsRepoPayload,
  GetOrderPaymentsRepoPayload,
  GetOrderPaymentsRepoResult,
  OrderPaymentDB,
  OrderPaymentDBPopulated,
  OrderPaymentPopulatedRepoItem,
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
      orderId: order,
      cashregisterId: cashregister,
      cashregisterAccountId: cashregisterAccount,
      currencyId: currency,
      paymentStatus,
      paymentDate,
      transactionId: transaction,
      createdBy,
      removedBy,
      createdAt,
      updatedAt,
    },
    rules: {
      _id: { type: 'array' },
      orderId: { type: 'array' },
      cashregisterId: { type: 'string' },
      cashregisterAccountId: { type: 'string' },
      currencyId: { type: 'string' },
      paymentStatus: { type: 'string' },
      paymentDate: { type: 'dateRange' },
      transactionId: { type: 'string' },
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
        localField: 'currencyId',
        foreignField: '_id',
        as: 'currencyData',
      },
    },
    {
      $addFields: {
        currency: { $arrayElemAt: ['$currencyData', 0] },
      },
    },
    {
      $unset: 'currencyData',
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        order: '$orderId',
        cashregister: '$cashregisterId',
        cashregisterAccount: '$cashregisterAccountId',
        currency: { id: '$currency._id', names: '$currency.names', symbols: '$currency.symbols', scale: '$currency.scale', paymentEpsilon: '$currency.paymentEpsilon' },
        minorAmount: 1,
        paymentStatus: 1,
        paymentDate: 1,
        transaction: '$transactionId',
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

  const raw = await OrderPaymentModel.aggregate<AggregateResult<OrderPaymentPopulatedRepoItem>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize }
}

export async function getById({ id }: { id: string }): Promise<OrderPaymentDBPopulated | null> {
  const [doc] = await OrderPaymentModel.aggregate<OrderPaymentDBPopulated>([
    {
      $match: {
        _id: id,
      },
    },
    {
      $lookup: {
        from: 'currencies',
        localField: 'currencyId',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              id: '$_id',
              names: 1,
              symbols: 1,
              scale: 1,
            },
          },
        ],
        as: 'currency',
      },
    },
    {
      $unwind: {
        path: '$currency',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unset: 'currencyId',
    },
  ]).exec()

  if (doc === null)
    return null

  return doc
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
