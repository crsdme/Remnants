import type { AggregateResult } from '@remnant/shared'
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
    full,
  } = payload.pagination

  const {
    order,
    cashregister,
    cashregisterAccount,
    currency,
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
        from: 'cashregisters',
        localField: 'cashregisterId',
        foreignField: '_id',
        as: 'cashregister',
      },
    },
    {
      $lookup: {
        from: 'cashregister-accounts',
        localField: 'cashregisterAccountId',
        foreignField: '_id',
        as: 'cashregisterAccount',
      },
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
        cashregister: { $arrayElemAt: ['$cashregister', 0] },
        cashregisterAccount: { $arrayElemAt: ['$cashregisterAccount', 0] },
        currency: { $arrayElemAt: ['$currencyData', 0] },
      },
    },
    {
      $unset: 'currencyData',
    },
    {
      $project: {
        _id: 1,
        orderId: 1,
        cashregister: { id: '$cashregister._id', names: '$cashregister.names' },
        cashregisterAccount: { id: '$cashregisterAccount._id', names: '$cashregisterAccount.names' },
        currency: { id: '$currency._id', names: '$currency.names', symbols: '$currency.symbols', scale: '$currency.scale', paymentEpsilon: '$currency.paymentEpsilon' },
        minorAmount: 1,
        paymentDate: 1,
        transactionId: 1,
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

  const raw = await OrderPaymentModel.aggregate<AggregateResult<OrderPaymentDBPopulated>>(pipeline).exec()
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
        from: 'cashregisters',
        localField: 'cashregisterId',
        foreignField: '_id',
        as: 'cashregister',
      },
    },
    {
      $lookup: {
        from: 'cashregister-accounts',
        localField: 'cashregisterAccountId',
        foreignField: '_id',
        as: 'cashregisterAccount',
      },
    },
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
        cashregister: { $arrayElemAt: ['$cashregister', 0] },
        cashregisterAccount: { $arrayElemAt: ['$cashregisterAccount', 0] },
        currency: { $arrayElemAt: ['$currency', 0] },
      },
    },
    {
      $project: {
        _id: 1,
        orderId: 1,
        cashregister: {
          id: '$cashregister._id',
          names: '$cashregister.names',
        },
        cashregisterAccount: {
          id: '$cashregisterAccount._id',
          names: '$cashregisterAccount.names',
        },
        currency: {
          id: '$currency._id',
          names: '$currency.names',
          symbols: '$currency.symbols',
          scale: '$currency.scale',
        },
        minorAmount: 1,
        paymentDate: 1,
        transactionId: 1,
        comment: 1,
        createdBy: 1,
        removedBy: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]).exec()

  return doc ?? null
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
