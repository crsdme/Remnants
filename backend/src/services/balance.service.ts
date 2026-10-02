import type {
  AuthUser,
  BalanceComputedDTO,
  CreateBalanceResponse,
  GetBalancesResponse,
  GetCurrentBalanceResponse,
  RemoveBalancesResponse,
} from '@remnant/shared'
import type {
  CreateBalancesPayload,
  GetBalancesPayload,
  RemoveBalancesPayload,
} from '@/types'
import { mapBalanceComputed, mapBalanceToDTO } from '@/mappers/balance.mapper'
import * as BalanceRepo from '@/repositories/balance.repo'
import * as MoneyTransactionRepo from '@/repositories/money-transaction.repo'
import * as OrderRepo from '@/repositories/order.repo'
import * as PaymentApplicationRepo from '@/repositories/payment-application.repo'
import * as ProcurementRepo from '@/repositories/procurement.repo'
import * as StockLotRepo from '@/repositories/stock-lot.repo'
import * as StockMoveRepo from '@/repositories/stock-move.repo'
import { takeFromLayers } from '@/services/fifo.utils'
import { HttpError } from '@/utils/'

function addMinor(
  map: Map<string, number>,
  currencyId: string,
  minorAmount: number,
) {
  map.set(currencyId, (map.get(currencyId) ?? 0) + minorAmount)
}

function groupCurrencyTotals(
  rows: Array<{ key: string, currencyId: string, minorAmount: number }>,
): Map<string, Array<{ currencyId: string, minorAmount: number }>> {
  const map = new Map<string, Map<string, number>>()
  for (const row of rows) {
    if (row.minorAmount === 0)
      continue
    let inner = map.get(row.key)
    if (!inner) {
      inner = new Map()
      map.set(row.key, inner)
    }
    inner.set(row.currencyId, (inner.get(row.currencyId) ?? 0) + row.minorAmount)
  }
  const result = new Map<string, Array<{ currencyId: string, minorAmount: number }>>()
  for (const [key, inner] of map) {
    result.set(
      key,
      [...inner.entries()]
        .map(([currencyId, minorAmount]) => ({ currencyId, minorAmount }))
        .sort((a, b) => a.currencyId.localeCompare(b.currencyId)),
    )
  }
  return result
}

function toDbTotals(totals: Array<{ currencyId: string, minorAmount: number }>) {
  return totals.map(total => ({
    currencyId: total.currencyId,
    minorAmount: Number(total.minorAmount),
  }))
}

export async function computeCompanyBalance(comment?: string): Promise<BalanceComputedDTO> {
  const [
    cashRows,
    warehouseRows,
    transitMoves,
    procurementMeta,
    procurementValueRows,
    dueOrderRows,
  ] = await Promise.all([
    MoneyTransactionRepo.sumMinorByCashregisterCurrency(),
    StockLotRepo.sumValueByWarehouseCurrency(),
    StockMoveRepo.listOpenTransit(),
    ProcurementRepo.listActiveProcurementMeta(),
    ProcurementRepo.listValueByProcurementCurrency(),
    OrderRepo.sumOpenItemMinorsByOrder(),
  ])

  const cashGrouped = groupCurrencyTotals(
    cashRows.map(row => ({
      key: String(row.cashregisterId),
      currencyId: String(row.currencyId),
      minorAmount: Number(row.minorAmount) || 0,
    })),
  )
  const cashregisterBalance = [...cashGrouped.entries()]
    .map(([cashregisterId, totals]) => ({ cashregisterId, totals }))
    .sort((a, b) => a.cashregisterId.localeCompare(b.cashregisterId))

  const warehouseGrouped = groupCurrencyTotals(
    warehouseRows.map(row => ({
      key: String(row.warehouseId),
      currencyId: String(row.currencyId),
      minorAmount: Number(row.minorAmount) || 0,
    })),
  )
  const warehouseBalance = [...warehouseGrouped.entries()]
    .map(([warehouseId, totals]) => ({ warehouseId, totals }))
    .sort((a, b) => a.warehouseId.localeCompare(b.warehouseId))

  const transitRaw: Array<{
    key: string
    fromWarehouseId: string | null
    currencyId: string
    minorAmount: number
  }> = []
  for (const move of transitMoves) {
    const quantity = Number(move.quantity) || 0
    const openQuantity = Number(move.openQuantity) || 0
    if (openQuantity <= 0 || quantity <= 0)
      continue
    const layers = (move.layers ?? []).map(layer => ({
      quantity: Number(layer.quantity) || 0,
      minorUnitCost: Number(layer.minorUnitCost) || 0,
      currencyId: String(layer.currencyId),
    }))
    const remaining = takeFromLayers(layers, Math.max(0, quantity - openQuantity), openQuantity)
    const byCurrency = new Map<string, number>()
    for (const layer of remaining)
      addMinor(byCurrency, layer.currencyId, layer.quantity * layer.minorUnitCost)
    for (const [currencyId, minorAmount] of byCurrency) {
      transitRaw.push({
        key: String(move.documentId),
        fromWarehouseId: move.fromWarehouseId != null ? String(move.fromWarehouseId) : null,
        currencyId,
        minorAmount,
      })
    }
  }
  const transitGrouped = groupCurrencyTotals(
    transitRaw.map(row => ({
      key: row.key,
      currencyId: row.currencyId,
      minorAmount: row.minorAmount,
    })),
  )
  const fromWarehouseByDoc = new Map(transitRaw.map(row => [row.key, row.fromWarehouseId]))
  const transitBalance = [...transitGrouped.entries()]
    .map(([warehouseTransactionId, totals]) => ({
      warehouseTransactionId,
      fromWarehouseId: fromWarehouseByDoc.get(warehouseTransactionId) ?? null,
      totals,
    }))
    .sort((a, b) => a.warehouseTransactionId.localeCompare(b.warehouseTransactionId))

  const supplierByProcurement = new Map(
    procurementMeta.map(row => [String(row._id), String(row.supplierId)]),
  )
  const procurementIds = [...supplierByProcurement.keys()]
  const supplierIds = [...new Set(supplierByProcurement.values())]

  const [paidAppRows, legacyProcurementCash, supplierCashRows] = await Promise.all([
    PaymentApplicationRepo.sumActiveMinorsByDocumentIds(procurementIds),
    MoneyTransactionRepo.sumActiveMinorsBySource('procurement', procurementIds),
    MoneyTransactionRepo.sumActiveMinorsBySource('supplier', supplierIds),
  ])

  const orderedByKey = new Map<string, number>()
  const receivedByKey = new Map<string, number>()
  const currenciesByProcurement = new Map<string, Set<string>>()
  for (const row of procurementValueRows) {
    const procurementId = String(row.procurementId)
    const currencyId = String(row.currencyId)
    const key = `${procurementId}:${currencyId}`
    orderedByKey.set(key, Number(row.orderedMinor) || 0)
    receivedByKey.set(key, Number(row.receivedMinor) || 0)
    let set = currenciesByProcurement.get(procurementId)
    if (!set) {
      set = new Set()
      currenciesByProcurement.set(procurementId, set)
    }
    set.add(currencyId)
  }

  const paidByKey = new Map<string, number>()
  const appPaidKeys = new Set<string>()
  const allocatedBySupplierCurrency = new Map<string, number>()
  function addPaid(procurementId: string, currencyId: string, minorAmount: number, fromApp: boolean) {
    if (minorAmount === 0)
      return
    const key = `${procurementId}:${currencyId}`
    if (!fromApp && appPaidKeys.has(key))
      return
    if (fromApp)
      appPaidKeys.add(key)
    paidByKey.set(key, (paidByKey.get(key) ?? 0) + minorAmount)
    let set = currenciesByProcurement.get(procurementId)
    if (!set) {
      set = new Set()
      currenciesByProcurement.set(procurementId, set)
    }
    set.add(currencyId)
    const supplierId = supplierByProcurement.get(procurementId)
    if (supplierId !== undefined) {
      const sk = `${supplierId}:${currencyId}`
      allocatedBySupplierCurrency.set(sk, (allocatedBySupplierCurrency.get(sk) ?? 0) + minorAmount)
    }
  }
  for (const row of paidAppRows)
    addPaid(String(row.sourceId), String(row.currencyId), Number(row.minorAmount) || 0, true)
  for (const row of legacyProcurementCash)
    addPaid(String(row.sourceId), String(row.currencyId), Number(row.minorAmount) || 0, false)

  const orderedNotReceivedRaw: Array<{ key: string, supplierId: string, currencyId: string, minorAmount: number }> = []
  const prepaidRaw: Array<{ key: string, currencyId: string, minorAmount: number }> = []
  const debtRaw: Array<{ key: string, supplierId: string, currencyId: string, minorAmount: number }> = []
  for (const [procurementId, currencies] of currenciesByProcurement) {
    const supplierId = supplierByProcurement.get(procurementId)
    if (supplierId === undefined)
      continue
    for (const currencyId of currencies) {
      const key = `${procurementId}:${currencyId}`
      const ordered = orderedByKey.get(key) ?? 0
      const received = receivedByKey.get(key) ?? 0
      const paid = paidByKey.get(key) ?? 0
      // Goods still outstanding = asset; paid above ordered = prepaid; unpaid ordered = debt
      const onOrder = Math.max(0, ordered - received)
      const overpay = Math.max(0, paid - ordered)
      const debt = Math.max(0, ordered - paid)
      if (onOrder > 0)
        orderedNotReceivedRaw.push({ key: procurementId, supplierId, currencyId, minorAmount: onOrder })
      if (overpay > 0)
        prepaidRaw.push({ key: procurementId, currencyId, minorAmount: overpay })
      if (debt > 0)
        debtRaw.push({ key: procurementId, supplierId, currencyId, minorAmount: debt })
    }
  }

  // Unallocated supplier advances (cash to supplier not applied to a procurement)
  const supplierAdvanceRaw: Array<{ key: string, currencyId: string, minorAmount: number }> = []
  for (const row of supplierCashRows) {
    const supplierId = String(row.sourceId)
    const currencyId = String(row.currencyId)
    const paid = Number(row.minorAmount) || 0
    const allocated = allocatedBySupplierCurrency.get(`${supplierId}:${currencyId}`) ?? 0
    const advance = Math.max(0, paid - allocated)
    if (advance > 0)
      supplierAdvanceRaw.push({ key: supplierId, currencyId, minorAmount: advance })
  }

  const orderedGrouped = groupCurrencyTotals(
    orderedNotReceivedRaw.map(row => ({ key: row.key, currencyId: row.currencyId, minorAmount: row.minorAmount })),
  )
  const supplierByOrdered = new Map(orderedNotReceivedRaw.map(row => [row.key, row.supplierId]))
  const orderedNotReceivedBalance = [...orderedGrouped.entries()]
    .map(([procurementId, totals]) => ({
      procurementId,
      supplierId: supplierByOrdered.get(procurementId) ?? '',
      totals,
    }))
    .filter(row => row.supplierId !== '')
    .sort((a, b) => a.procurementId.localeCompare(b.procurementId))

  const prepaidGrouped = groupCurrencyTotals(prepaidRaw)
  const advanceGrouped = groupCurrencyTotals(supplierAdvanceRaw)
  const prepaidBalance = [
    ...[...prepaidGrouped.entries()].map(([procurementId, totals]) => ({
      procurementId,
      totals,
    })),
    ...[...advanceGrouped.entries()].map(([supplierId, totals]) => ({
      supplierId,
      totals,
    })),
  ].sort((a, b) => {
    const aKey = ('procurementId' in a && a.procurementId) || ('supplierId' in a && a.supplierId) || ''
    const bKey = ('procurementId' in b && b.procurementId) || ('supplierId' in b && b.supplierId) || ''
    return String(aKey).localeCompare(String(bKey))
  })

  const debtGrouped = groupCurrencyTotals(
    debtRaw.map(row => ({ key: row.key, currencyId: row.currencyId, minorAmount: row.minorAmount })),
  )
  const supplierByDebt = new Map(debtRaw.map(row => [row.key, row.supplierId]))
  const supplierDebtBalance = [...debtGrouped.entries()]
    .map(([procurementId, totals]) => ({
      procurementId,
      supplierId: supplierByDebt.get(procurementId) ?? '',
      totals,
    }))
    .filter(row => row.supplierId !== '')
    .sort((a, b) => a.procurementId.localeCompare(b.procurementId))

  const orderIds = [...new Set(dueOrderRows.map(row => String(row.orderId)))]
  const [orderPaidAppRows, legacyOrderCash] = await Promise.all([
    PaymentApplicationRepo.sumActiveMinorsByDocumentIds(orderIds),
    MoneyTransactionRepo.sumActiveMinorsBySource('order', orderIds),
  ])
  const orderPaidByKey = new Map<string, number>()
  const orderAppPaidKeys = new Set<string>()
  for (const row of orderPaidAppRows) {
    const key = `${String(row.sourceId)}:${String(row.currencyId)}`
    orderAppPaidKeys.add(key)
    orderPaidByKey.set(key, (orderPaidByKey.get(key) ?? 0) + (Number(row.minorAmount) || 0))
  }
  for (const row of legacyOrderCash) {
    const key = `${String(row.sourceId)}:${String(row.currencyId)}`
    if (orderAppPaidKeys.has(key))
      continue
    orderPaidByKey.set(key, (orderPaidByKey.get(key) ?? 0) + (Number(row.minorAmount) || 0))
  }
  const receivableRaw: Array<{
    key: string
    clientId: string | null
    currencyId: string
    minorAmount: number
  }> = []
  for (const row of dueOrderRows) {
    const orderId = String(row.orderId)
    const currencyId = String(row.currencyId)
    const due = Number(row.minorAmount) || 0
    const paid = orderPaidByKey.get(`${orderId}:${currencyId}`) ?? 0
    const remaining = Math.max(0, due - paid)
    if (remaining <= 0)
      continue
    receivableRaw.push({
      key: orderId,
      clientId: row.clientId != null ? String(row.clientId) : null,
      currencyId,
      minorAmount: remaining,
    })
  }
  const receivableGrouped = groupCurrencyTotals(
    receivableRaw.map(row => ({ key: row.key, currencyId: row.currencyId, minorAmount: row.minorAmount })),
  )
  const clientByOrder = new Map(receivableRaw.map(row => [row.key, row.clientId]))
  const receivableBalance = [...receivableGrouped.entries()]
    .map(([orderId, totals]) => ({
      orderId,
      clientId: clientByOrder.get(orderId) ?? null,
      totals,
    }))
    .sort((a, b) => a.orderId.localeCompare(b.orderId))

  const totalMap = new Map<string, number>()
  for (const block of [
    ...cashregisterBalance,
    ...warehouseBalance,
    ...transitBalance,
    ...orderedNotReceivedBalance,
    ...prepaidBalance,
    ...receivableBalance,
  ]) {
    for (const total of block.totals)
      addMinor(totalMap, total.currencyId, total.minorAmount)
  }
  for (const block of supplierDebtBalance) {
    for (const total of block.totals)
      addMinor(totalMap, total.currencyId, -total.minorAmount)
  }

  const totalBalances = [...totalMap.entries()]
    .map(([currencyId, minorAmount]) => ({ currencyId, minorAmount }))
    .filter(row => row.minorAmount !== 0)
    .sort((a, b) => a.currencyId.localeCompare(b.currencyId))

  return mapBalanceComputed({
    totalBalances,
    cashregisterBalance,
    warehouseBalance,
    transitBalance,
    orderedNotReceivedBalance,
    prepaidBalance,
    receivableBalance,
    supplierDebtBalance,
    comment,
  })
}

export async function get({ payload }: { payload: GetBalancesPayload }): Promise<GetBalancesResponse> {
  const { items, total, page, pageSize } = await BalanceRepo.list(payload)

  return {
    status: 'success',
    code: 'BALANCE_FETCHED',
    message: 'Balance fetched',
    data: {
      items: items.map(mapBalanceToDTO),
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function getCurrent(): Promise<GetCurrentBalanceResponse> {
  const data = await computeCompanyBalance()

  return {
    status: 'success',
    code: 'BALANCE_FETCHED',
    message: 'Balance fetched',
    data,
  }
}

export async function create({
  payload,
  user,
}: {
  payload: CreateBalancesPayload
  user: AuthUser
}): Promise<CreateBalanceResponse> {
  const computed = await computeCompanyBalance(payload.comment)

  const created = await BalanceRepo.createOne({
    totalBalances: toDbTotals(computed.totalBalances),
    cashregisterBalance: computed.cashregisterBalance.map(row => ({
      cashregisterId: row.cashregisterId,
      totals: toDbTotals(row.totals),
    })),
    warehouseBalance: computed.warehouseBalance.map(row => ({
      warehouseId: row.warehouseId,
      totals: toDbTotals(row.totals),
    })),
    transitBalance: computed.transitBalance.map(row => ({
      warehouseTransactionId: row.warehouseTransactionId,
      fromWarehouseId: row.fromWarehouseId ?? null,
      totals: toDbTotals(row.totals),
    })),
    orderedNotReceivedBalance: computed.orderedNotReceivedBalance.map(row => ({
      procurementId: row.procurementId,
      supplierId: row.supplierId,
      totals: toDbTotals(row.totals),
    })),
    prepaidBalance: computed.prepaidBalance.map(row => ({
      procurementId: row.procurementId,
      supplierId: row.supplierId,
      totals: toDbTotals(row.totals),
    })),
    receivableBalance: computed.receivableBalance.map(row => ({
      orderId: row.orderId,
      clientId: row.clientId ?? null,
      totals: toDbTotals(row.totals),
    })),
    supplierDebtBalance: computed.supplierDebtBalance.map(row => ({
      procurementId: row.procurementId,
      supplierId: row.supplierId,
      totals: toDbTotals(row.totals),
    })),
    comment: payload.comment,
    createdBy: user.id,
  })

  return {
    status: 'success',
    code: 'BALANCE_CREATED',
    message: 'Balance created',
    data: mapBalanceToDTO({
      _id: String(created._id),
      seq: Number(created.seq),
      totalBalances: toDbTotals(computed.totalBalances),
      cashregisterBalance: computed.cashregisterBalance.map(row => ({
        cashregisterId: row.cashregisterId,
        totals: toDbTotals(row.totals),
      })),
      warehouseBalance: computed.warehouseBalance.map(row => ({
        warehouseId: row.warehouseId,
        totals: toDbTotals(row.totals),
      })),
      transitBalance: computed.transitBalance.map(row => ({
        warehouseTransactionId: row.warehouseTransactionId,
        fromWarehouseId: row.fromWarehouseId ?? null,
        totals: toDbTotals(row.totals),
      })),
      orderedNotReceivedBalance: computed.orderedNotReceivedBalance.map(row => ({
        procurementId: row.procurementId,
        supplierId: row.supplierId,
        totals: toDbTotals(row.totals),
      })),
      prepaidBalance: computed.prepaidBalance.map(row => ({
        procurementId: row.procurementId,
        supplierId: row.supplierId,
        totals: toDbTotals(row.totals),
      })),
      receivableBalance: computed.receivableBalance.map(row => ({
        orderId: row.orderId,
        clientId: row.clientId ?? null,
        totals: toDbTotals(row.totals),
      })),
      supplierDebtBalance: computed.supplierDebtBalance.map(row => ({
        procurementId: row.procurementId,
        supplierId: row.supplierId,
        totals: toDbTotals(row.totals),
      })),
      comment: String(created.comment ?? ''),
      createdBy: user.id,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    }),
  }
}

export async function remove({ payload }: { payload: RemoveBalancesPayload }): Promise<RemoveBalancesResponse> {
  const balance = await BalanceRepo.removeById(payload.id)

  if (balance === null)
    throw new HttpError(400, 'Balance not removed', 'BALANCE_NOT_REMOVED')

  return {
    status: 'success',
    code: 'BALANCE_REMOVED',
    message: 'Balance removed',
  }
}
