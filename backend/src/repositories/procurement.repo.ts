import type { AggregateResult, LanguageString, ProcurementDTO, ProcurementItemDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateProcurementItemRepoPayload,
  CreateProcurementRepoPayload,
  GetProcurementItemsRepoPayload,
  GetProcurementItemsRepoResult,
  GetProcurementsRepoPayload,
  GetProcurementsRepoResult,
  ProcurementDB,
} from '@/types/'
import { toMinorType } from '@remnant/shared'
import { ProcurementItemModel, ProcurementModel } from '@/models'
import { buildQuery, buildSortQuery, fromMinor, unwrapAggregate } from '@/utils'

interface CurrencyAmountRow {
  currency: {
    id: string
    names: LanguageString
    symbols: LanguageString
    scale?: number
  }
  amount: number
}

function toMajor(minor: number, scale = 2) {
  return Number.parseFloat(fromMinor(toMinorType(minor), scale))
}

function groupByCurrency(
  rows: Array<{ currencyId: string, minorAmount: number, currency?: { _id?: string, id?: string, names?: LanguageString, symbols?: LanguageString, scale?: number } }>,
): CurrencyAmountRow[] {
  const grouped = new Map<string, CurrencyAmountRow>()

  for (const row of rows) {
    const currencyId = row.currencyId
    const scale = row.currency?.scale ?? 2
    const existing = grouped.get(currencyId)
    const amount = toMajor(row.minorAmount, scale)
    if (existing) {
      existing.amount += amount
      continue
    }
    grouped.set(currencyId, {
      currency: {
        id: String(row.currency?._id ?? row.currency?.id ?? currencyId),
        names: row.currency?.names ?? { en: '', ru: '' },
        symbols: row.currency?.symbols ?? { en: '', ru: '' },
        scale,
      },
      amount,
    })
  }

  return [...grouped.values()]
}

export async function list(payload: GetProcurementsRepoPayload): Promise<GetProcurementsRepoResult> {
  const { current, pageSize, full } = payload.pagination
  const {
    ids,
    seq,
    supplierId,
    status,
    paymentStatus,
    warehouseId,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { _id: ids, seq, supplierId, status, paymentStatus, warehouseId, createdAt, updatedAt },
    rules: {
      _id: { type: 'array' },
      seq: { type: 'array' },
      supplierId: { type: 'exact' },
      status: { type: 'string' },
      paymentStatus: { type: 'string' },
      warehouseId: { type: 'exact' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
    removed: false,
  })

  const sorters = buildSortQuery(payload.sorters, { seq: -1 })

  const pipeline: PipelineStage[] = [
    { $match: query },
    { $sort: sorters },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplierId',
        foreignField: '_id',
        as: 'supplier',
      },
    },
    {
      $lookup: {
        from: 'warehouses',
        localField: 'warehouseId',
        foreignField: '_id',
        as: 'warehouse',
      },
    },
    {
      $lookup: {
        from: 'procurement-items',
        localField: '_id',
        foreignField: 'procurementId',
        as: 'items',
      },
    },
    {
      $lookup: {
        from: 'payment-applications',
        let: { procurementId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$documentId', '$$procurementId'] },
                  { $eq: ['$documentType', 'procurement'] },
                  { $ne: ['$cancelled', true] },
                ],
              },
            },
          },
        ],
        as: 'payments',
      },
    },
    {
      $lookup: {
        from: 'currencies',
        localField: 'items.purchaseCurrencyId',
        foreignField: '_id',
        as: 'itemCurrencies',
      },
    },
    {
      $lookup: {
        from: 'currencies',
        localField: 'payments.currencyId',
        foreignField: '_id',
        as: 'paymentCurrencies',
      },
    },
    {
      $addFields: {
        supplier: { $arrayElemAt: ['$supplier', 0] },
        warehouse: { $arrayElemAt: ['$warehouse', 0] },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        seq: 1,
        supplierId: 1,
        warehouseId: 1,
        status: 1,
        paymentStatus: 1,
        expenseIds: 1,
        paymentIds: 1,
        comment: 1,
        createdBy: 1,
        removedBy: 1,
        createdAt: 1,
        updatedAt: 1,
        items: 1,
        payments: 1,
        itemCurrencies: 1,
        paymentCurrencies: 1,
        supplier: {
          $cond: [
            { $ifNull: ['$supplier', false] },
            { id: '$supplier._id', seq: { $ifNull: ['$supplier.seq', 0] }, name: '$supplier.name' },
            null,
          ],
        },
        warehouse: {
          $cond: [
            { $ifNull: ['$warehouse', false] },
            { id: '$warehouse._id', names: '$warehouse.names' },
            null,
          ],
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

  const raw = await ProcurementModel.aggregate<AggregateResult<Record<string, unknown>>>(pipeline).exec()
  const { items: rows, total } = unwrapAggregate(raw)

  const items: ProcurementDTO[] = rows.map((row) => {
    const itemCurrencies = (row.itemCurrencies as Array<{ _id: string, names: LanguageString, symbols: LanguageString, scale?: number }>) ?? []
    const paymentCurrencies = (row.paymentCurrencies as Array<{ _id: string, names: LanguageString, symbols: LanguageString, scale?: number }>) ?? []
    const currencyById = new Map([...itemCurrencies, ...paymentCurrencies].map(currency => [String(currency._id), currency]))

    const itemRows = ((row.items as Array<{ purchaseCurrencyId: string, quantity: number, minorPurchasePrice?: number }>) ?? []).map(item => ({
      currencyId: item.purchaseCurrencyId,
      minorAmount: (item.minorPurchasePrice ?? 0) * (item.quantity ?? 0),
      currency: currencyById.get(item.purchaseCurrencyId),
    }))
    const paymentRows = ((row.payments as Array<{ currencyId: string, minorAmount: number, cancelled?: boolean }>) ?? [])
      .filter(payment => !payment.cancelled)
      .map(payment => ({
        currencyId: payment.currencyId,
        minorAmount: payment.minorAmount ?? 0,
        currency: currencyById.get(payment.currencyId),
      }))

    const itemsByCurrency = groupByCurrency(itemRows)
    const paymentsByCurrency = groupByCurrency(paymentRows)
    const currencyIds = new Set([...itemsByCurrency.map(row => row.currency.id), ...paymentsByCurrency.map(row => row.currency.id)])
    const balanceByCurrency = [...currencyIds].map((currencyId) => {
      const due = itemsByCurrency.find(row => row.currency.id === currencyId)
      const paid = paymentsByCurrency.find(row => row.currency.id === currencyId)
      return {
        currency: due?.currency ?? paid!.currency,
        amount: (due?.amount ?? 0) - (paid?.amount ?? 0),
      }
    })

    return {
      id: String(row.id),
      seq: Number(row.seq),
      supplierId: String(row.supplierId),
      supplier: row.supplier as ProcurementDTO['supplier'],
      status: String(row.status),
      paymentStatus: String(row.paymentStatus ?? 'unpaid'),
      warehouseId: row.warehouseId != null ? String(row.warehouseId) : null,
      warehouse: (row.warehouse as ProcurementDTO['warehouse']) ?? null,
      expenseIds: (row.expenseIds as string[]) ?? [],
      paymentIds: (row.paymentIds as string[]) ?? [],
      itemsByCurrency,
      paymentsByCurrency,
      balanceByCurrency,
      createdBy: row.createdBy != null ? String(row.createdBy) : undefined,
      removedBy: row.removedBy != null ? String(row.removedBy) : null,
      comment: row.comment !== undefined ? String(row.comment) : '',
      createdAt: row.createdAt as Date,
      updatedAt: row.updatedAt as Date,
    }
  })

  return { items, total, page: current, pageSize: full ? Math.max(total, pageSize) : pageSize }
}

export async function listItems(payload: GetProcurementItemsRepoPayload): Promise<GetProcurementItemsRepoResult> {
  const { current, pageSize, full } = payload.pagination
  const { procurementId } = payload.filters

  const query = buildQuery({
    filters: { procurementId },
    rules: {
      procurementId: { type: 'exact' },
    },
    removed: false,
  })

  const pipeline: PipelineStage[] = [
    { $match: query },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'product',
      },
    },
    {
      $addFields: {
        product: { $arrayElemAt: ['$product', 0] },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        procurementId: 1,
        productId: 1,
        quantity: 1,
        receivedQuantity: 1,
        minorPurchasePrice: 1,
        purchaseCurrencyId: 1,
        product: {
          $cond: [
            { $ifNull: ['$product', false] },
            { id: '$product._id', names: '$product.names' },
            '$$REMOVE',
          ],
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

  const raw = await ProcurementItemModel.aggregate<AggregateResult<ProcurementItemDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  return { items, total, page: current, pageSize: full ? Math.max(total, pageSize) : pageSize }
}

export async function createOne(payload: CreateProcurementRepoPayload) {
  const [procurement] = await ProcurementModel.create([payload])
  return procurement
}

export async function createItems(payload: CreateProcurementItemRepoPayload[]) {
  if (payload.length === 0)
    return []
  return ProcurementItemModel.create(payload)
}

export async function deleteItemsByProcurementId(procurementId: string) {
  return ProcurementItemModel.deleteMany({ procurementId }).exec()
}

export async function findById(id: string) {
  return ProcurementModel.findById(id).exec()
}

export async function findItemById(id: string) {
  return ProcurementItemModel.findById(id).exec()
}

export async function listItemsByProcurementId(procurementId: string) {
  return ProcurementItemModel.find({ procurementId }).exec()
}

export async function updateById(id: string, payload: Partial<ProcurementDB>) {
  return ProcurementModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function updateItemReceived({
  procurementId,
  productId,
  receivedQuantity,
}: {
  procurementId: string
  productId: string
  receivedQuantity: number
}) {
  return ProcurementItemModel.findOneAndUpdate(
    { procurementId, productId },
    { $inc: { receivedQuantity } },
    { new: true },
  ).exec()
}

export async function setItemReceived({
  procurementId,
  productId,
  receivedQuantity,
}: {
  procurementId: string
  productId: string
  receivedQuantity: number
}) {
  return ProcurementItemModel.findOneAndUpdate(
    { procurementId, productId },
    { $set: { receivedQuantity: Math.max(0, receivedQuantity) } },
    { new: true },
  ).exec()
}

export async function listIdsBySupplierIds(supplierIds: string[]) {
  if (supplierIds.length === 0)
    return []

  return ProcurementModel.find({
    supplierId: { $in: supplierIds },
    removed: { $ne: true },
  }).select({ _id: 1, supplierId: 1, paymentIds: 1, paymentStatus: 1, status: 1 }).lean().exec()
}

export async function listActiveProcurementMeta() {
  return ProcurementModel.find({
    removed: { $ne: true },
    status: { $ne: 'cancelled' },
  }).select({ _id: 1, supplierId: 1 }).lean().exec()
}

export async function listValueByProcurementCurrency() {
  return ProcurementModel.aggregate<{
    procurementId: string
    supplierId: string
    currencyId: string
    orderedMinor: number
    receivedMinor: number
  }>([
    {
      $match: {
        removed: { $ne: true },
        status: { $ne: 'cancelled' },
      },
    },
    {
      $lookup: {
        from: 'procurement-items',
        localField: '_id',
        foreignField: 'procurementId',
        as: 'items',
      },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: {
          procurementId: '$_id',
          supplierId: '$supplierId',
          currencyId: '$items.purchaseCurrencyId',
        },
        orderedMinor: {
          $sum: {
            $multiply: [
              { $ifNull: ['$items.minorPurchasePrice', 0] },
              { $ifNull: ['$items.quantity', 0] },
            ],
          },
        },
        receivedMinor: {
          $sum: {
            $multiply: [
              { $ifNull: ['$items.minorPurchasePrice', 0] },
              { $ifNull: ['$items.receivedQuantity', 0] },
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        procurementId: '$_id.procurementId',
        supplierId: '$_id.supplierId',
        currencyId: '$_id.currencyId',
        orderedMinor: 1,
        receivedMinor: 1,
      },
    },
  ]).exec()
}

export async function sumOpenItemMinorsBySupplier(supplierIds: string[]) {
  if (supplierIds.length === 0)
    return []

  return ProcurementModel.aggregate<Array<{
    supplierId: string
    currencyId: string
    minorAmount: number
  }>[number]>([
    {
      $match: {
        supplierId: { $in: supplierIds },
        removed: { $ne: true },
        status: { $ne: 'cancelled' },
        paymentStatus: { $ne: 'paid' },
      },
    },
    {
      $lookup: {
        from: 'procurement-items',
        localField: '_id',
        foreignField: 'procurementId',
        as: 'items',
      },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: {
          supplierId: '$supplierId',
          currencyId: '$items.purchaseCurrencyId',
        },
        minorAmount: {
          $sum: {
            $multiply: [
              { $ifNull: ['$items.minorPurchasePrice', 0] },
              { $ifNull: ['$items.quantity', 0] },
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        supplierId: '$_id.supplierId',
        currencyId: '$_id.currencyId',
        minorAmount: 1,
      },
    },
  ]).exec()
}
