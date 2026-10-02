import type { LanguageString, ProcurementDTO, SupplierBalanceDTO } from '@remnant/shared'
import { toMinorType } from '@remnant/shared'
import { mapCurrencyToDTO } from '@/mappers/currencies.mapper'
import * as CurrencyRepo from '@/repositories/currencies.repo'
import * as MoneyTransactionRepo from '@/repositories/money-transaction.repo'
import * as OrderRepo from '@/repositories/order.repo'
import * as PaymentApplicationRepo from '@/repositories/payment-application.repo'
import * as ProcurementRepo from '@/repositories/procurement.repo'
import { fromMinor, toMinor } from '@/utils/money'

export interface PartySettlement {
  debts: SupplierBalanceDTO[]
  payments: SupplierBalanceDTO[]
  balances: SupplierBalanceDTO[]
}

export type SupplierSettlement = PartySettlement

function toMajor(minor: number, scale = 2) {
  return Number.parseFloat(fromMinor(toMinorType(minor), scale))
}

function paymentStatusOf(row: Pick<ProcurementDTO, 'balanceByCurrency' | 'paymentsByCurrency'>): NonNullable<ProcurementDTO['paymentStatus']> {
  const balances = row.balanceByCurrency ?? []
  const payments = row.paymentsByCurrency ?? []
  const anyPaid = payments.some(item => item.amount > 0)
  const allZero = balances.length === 0 || balances.every(item => item.amount === 0)
  const anyNegative = balances.some(item => item.amount < 0)

  if (!anyPaid)
    return 'unpaid'
  if (anyNegative)
    return 'overpaid'
  if (allZero)
    return 'paid'
  return 'partially-paid'
}

function orderPaymentStatusOf(remainingByCurrency: Map<string, number>, paidByCurrency: Map<string, number>): 'paid' | 'unpaid' | 'partially_paid' | 'overpaid' {
  const anyPaid = [...paidByCurrency.values()].some(amount => amount > 0)
  const remaining = [...remainingByCurrency.values()]
  const allZero = remaining.length === 0 || remaining.every(amount => amount === 0)
  const anyNegative = remaining.some(amount => amount < 0)

  if (!anyPaid)
    return 'unpaid'
  if (anyNegative)
    return 'overpaid'
  if (allZero)
    return 'paid'
  return 'partially_paid'
}

async function currenciesById(ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))]
  const currencies = await CurrencyRepo.findByIds(unique)
  return new Map(currencies.map(currency => [currency._id, mapCurrencyToDTO(currency)]))
}

function toBalance(currencyId: string, minorAmount: number, currencies: Map<string, ReturnType<typeof mapCurrencyToDTO>>): SupplierBalanceDTO {
  const currency = currencies.get(currencyId)
  const scale = currency?.scale ?? 2

  return {
    currency: {
      id: currency?.id ?? currencyId,
      names: (currency?.names ?? { en: '', ru: '' }) as LanguageString,
      symbols: (currency?.symbols ?? { en: '', ru: '' }) as LanguageString,
      scale,
    },
    amount: toMajor(minorAmount, scale),
  }
}

function addMinor(target: Map<string, Map<string, number>>, partyId: string, currencyId: string, minorAmount: number) {
  const byCurrency = target.get(partyId) ?? new Map<string, number>()
  byCurrency.set(currencyId, (byCurrency.get(currencyId) ?? 0) + minorAmount)
  target.set(partyId, byCurrency)
}

async function getPartySettlements(
  partyIds: string[],
  kind: 'supplier' | 'client',
): Promise<Map<string, PartySettlement>> {
  const result = new Map<string, PartySettlement>()
  if (partyIds.length === 0)
    return result

  const [openItems, documents, partyCash] = kind === 'supplier'
    ? await Promise.all([
        ProcurementRepo.sumOpenItemMinorsBySupplier(partyIds),
        ProcurementRepo.listIdsBySupplierIds(partyIds),
        MoneyTransactionRepo.sumActiveMinorsBySource('supplier', partyIds),
      ])
    : await Promise.all([
        OrderRepo.sumOpenItemMinorsByClient(partyIds),
        OrderRepo.listIdsByClientIds(partyIds),
        MoneyTransactionRepo.sumActiveMinorsBySource('client', partyIds),
      ])

  const documentIds = documents.map(item => String(item._id))
  const [legacyCash, applications] = await Promise.all([
    MoneyTransactionRepo.sumActiveMinorsBySource(kind === 'supplier' ? 'procurement' : 'order', documentIds),
    PaymentApplicationRepo.sumActiveMinorsByDocumentIds(documentIds),
  ])
  const documentPartyId = new Map(documents.map((item) => {
    const partyId = kind === 'supplier'
      ? String((item as { supplierId: string }).supplierId)
      : String((item as { clientId: string }).clientId)
    return [String(item._id), partyId] as const
  }))
  const openIds = new Set(
    documents
      .filter((item) => {
        if (kind === 'supplier') {
          const row = item as { paymentStatus?: string, status?: string }
          return row.paymentStatus !== 'paid' && row.status !== 'cancelled'
        }
        return (item as { orderPaymentStatus?: string }).orderPaymentStatus !== 'paid'
      })
      .map(item => String(item._id)),
  )

  const debtMinors = new Map<string, Map<string, number>>()
  const paidMinors = new Map<string, Map<string, number>>()
  const creditMinors = new Map<string, Map<string, number>>()
  const allocatedMinors = new Map<string, Map<string, number>>()

  for (const row of openItems) {
    const partyId = kind === 'supplier'
      ? String((row as { supplierId: string }).supplierId)
      : String((row as { clientId: string }).clientId)
    addMinor(debtMinors, partyId, String(row.currencyId), Number(row.minorAmount) || 0)
  }

  for (const row of legacyCash) {
    const partyId = documentPartyId.get(String(row.sourceId))
    if (partyId === undefined)
      continue
    addMinor(paidMinors, partyId, String(row.currencyId), Number(row.minorAmount) || 0)
    if (openIds.has(String(row.sourceId)))
      addMinor(debtMinors, partyId, String(row.currencyId), -(Number(row.minorAmount) || 0))
  }

  for (const row of applications) {
    const partyId = documentPartyId.get(String(row.sourceId))
    if (partyId === undefined)
      continue
    addMinor(allocatedMinors, partyId, String(row.currencyId), Number(row.minorAmount) || 0)
    if (openIds.has(String(row.sourceId)))
      addMinor(debtMinors, partyId, String(row.currencyId), -(Number(row.minorAmount) || 0))
  }

  for (const row of partyCash) {
    addMinor(paidMinors, String(row.sourceId), String(row.currencyId), Number(row.minorAmount) || 0)
    addMinor(creditMinors, String(row.sourceId), String(row.currencyId), Number(row.minorAmount) || 0)
  }

  const currencyIds = [
    ...[...debtMinors.values()].flatMap(byCurrency => [...byCurrency.keys()]),
    ...[...paidMinors.values()].flatMap(byCurrency => [...byCurrency.keys()]),
    ...[...creditMinors.values()].flatMap(byCurrency => [...byCurrency.keys()]),
  ]
  const currencies = await currenciesById(currencyIds)

  for (const partyId of partyIds) {
    const debtsByCurrency = debtMinors.get(partyId) ?? new Map<string, number>()
    const paidByCurrency = paidMinors.get(partyId) ?? new Map<string, number>()
    const creditByCurrency = creditMinors.get(partyId) ?? new Map<string, number>()
    const allocatedByCurrency = allocatedMinors.get(partyId) ?? new Map<string, number>()
    const ids = new Set([...debtsByCurrency.keys(), ...paidByCurrency.keys(), ...creditByCurrency.keys(), ...allocatedByCurrency.keys()])
    const debts: SupplierBalanceDTO[] = []
    const payments: SupplierBalanceDTO[] = []
    const balances: SupplierBalanceDTO[] = []

    for (const currencyId of ids) {
      const remaining = Math.max(debtsByCurrency.get(currencyId) ?? 0, 0)
      const paid = paidByCurrency.get(currencyId) ?? 0
      const credit = Math.max((creditByCurrency.get(currencyId) ?? 0) - (allocatedByCurrency.get(currencyId) ?? 0), 0)
      if (remaining === 0 && paid === 0 && credit === 0)
        continue
      if (remaining > 0)
        debts.push(toBalance(currencyId, remaining, currencies))
      if (paid !== 0)
        payments.push(toBalance(currencyId, paid, currencies))
      if (credit > 0)
        balances.push(toBalance(currencyId, -credit, currencies))
    }

    result.set(partyId, { debts, payments, balances })
  }

  return result
}

export async function getSettlements(supplierIds: string[]): Promise<Map<string, PartySettlement>> {
  return getPartySettlements(supplierIds, 'supplier')
}

export async function getClientSettlements(clientIds: string[]): Promise<Map<string, PartySettlement>> {
  return getPartySettlements(clientIds, 'client')
}

async function remainingProcurementDebtMinor(procurementId: string, currencyId: string): Promise<{ supplierId: string, remainingMinor: number } | null> {
  const procurement = await ProcurementRepo.findById(procurementId)
  if (procurement === null || procurement.status === 'cancelled')
    return null

  const currency = await CurrencyRepo.findOne({ _id: currencyId })
  const scale = currency?.scale ?? 2
  const { items: [row] } = await ProcurementRepo.list({
    filters: { seq: [procurement.seq] },
    sorters: {},
    pagination: { current: 1, pageSize: 1, full: false },
  })
  if (row === undefined)
    return null

  const debt = row.balanceByCurrency.find(item => item.currency.id === currencyId)?.amount ?? 0
  return {
    supplierId: String(procurement.supplierId),
    remainingMinor: Number(toMinor(Math.max(debt, 0), scale)),
  }
}

async function remainingOrderDebtMinor(orderId: string, currencyId: string): Promise<{ clientId: string, remainingMinor: number } | null> {
  const order = await OrderRepo.findById(orderId)
  if (order === null || order.removed === true || !order.clientId)
    return null

  const itemMinors = await OrderRepo.sumItemMinorsByOrderIds([orderId])
  const applications = await PaymentApplicationRepo.sumActiveMinorsByDocumentIds([orderId])
  const itemMinor = itemMinors.find(row => String(row.currencyId) === currencyId)?.minorAmount ?? 0
  const paidMinor = applications.find(row => String(row.currencyId) === currencyId)?.minorAmount ?? 0
  return {
    clientId: String(order.clientId),
    remainingMinor: Math.max(Number(itemMinor) - Number(paidMinor), 0),
  }
}

async function applyCreditToDocument({
  documentId,
  partyId,
  partyType,
  documentType,
  currencyId,
  remainingMinor,
}: {
  documentId: string
  partyId: string
  partyType: 'supplier' | 'client'
  documentType: 'procurement' | 'order'
  currencyId: string
  remainingMinor: number
}): Promise<number> {
  if (remainingMinor <= 0)
    return 0

  const advances = (await MoneyTransactionRepo.listActiveBySource(partyType, [partyId]))
    .filter(item => item.currencyId === currencyId && item.minorAmount > 0)
  const usedByParent = await PaymentApplicationRepo.sumActiveMinorsByMoneyTransactionIds(advances.map(item => String(item._id)))

  let left = remainingMinor

  for (const advance of advances) {
    if (left <= 0)
      break

    const remaining = advance.minorAmount - (usedByParent.get(String(advance._id)) ?? 0)
    if (remaining <= 0)
      continue

    const take = Math.min(left, remaining)
    await PaymentApplicationRepo.createOne({
      partyType,
      partyId,
      documentType,
      documentId,
      moneyTransactionId: String(advance._id),
      currencyId,
      minorAmount: take,
      createdBy: advance.createdBy,
    })
    usedByParent.set(String(advance._id), Number(usedByParent.get(String(advance._id)) ?? 0) + take)
    left -= take
  }

  if (left !== remainingMinor) {
    if (documentType === 'procurement')
      await refreshPaymentStatus(documentId)
    else
      await refreshOrderPaymentStatus(documentId)
  }

  return remainingMinor - left
}

export async function allocateCreditToProcurement(procurementId: string, currencyId: string): Promise<number> {
  const debt = await remainingProcurementDebtMinor(procurementId, currencyId)
  if (debt === null)
    return 0

  return applyCreditToDocument({
    documentId: procurementId,
    partyId: debt.supplierId,
    partyType: 'supplier',
    documentType: 'procurement',
    currencyId,
    remainingMinor: debt.remainingMinor,
  })
}

export async function allocateCreditToOrder(orderId: string, currencyId: string): Promise<number> {
  const debt = await remainingOrderDebtMinor(orderId, currencyId)
  if (debt === null)
    return 0

  return applyCreditToDocument({
    documentId: orderId,
    partyId: debt.clientId,
    partyType: 'client',
    documentType: 'order',
    currencyId,
    remainingMinor: debt.remainingMinor,
  })
}

export async function allocateCreditFifo(supplierId: string, currencyId: string): Promise<void> {
  const { items } = await ProcurementRepo.list({
    filters: { supplierId },
    sorters: { createdAt: 'asc' },
    pagination: { current: 1, pageSize: 1, full: true },
  })

  for (const row of items) {
    if (row.status === 'cancelled')
      continue
    await allocateCreditToProcurement(row.id, currencyId)
  }
}

export async function allocateClientCreditFifo(clientId: string, currencyId: string): Promise<void> {
  const orders = await OrderRepo.listIdsByClientIds([clientId])
  for (const row of orders)
    await allocateCreditToOrder(String(row._id), currencyId)
}

/** If applications exceed item totals, cancel them and re-allocate — leftover stays as supplier advance. */
export async function reclaimOverallocatedProcurement(
  procurementId: string,
  cancelledBy: string,
): Promise<void> {
  const [items, apps] = await Promise.all([
    ProcurementRepo.listItemsByProcurementId(procurementId),
    PaymentApplicationRepo.listActiveByDocumentId(procurementId),
  ])
  if (apps.length === 0)
    return

  const due = new Map<string, number>()
  for (const item of items) {
    const currencyId = String(item.purchaseCurrencyId)
    due.set(currencyId, (due.get(currencyId) ?? 0) + (Number(item.minorPurchasePrice) || 0) * (Number(item.quantity) || 0))
  }

  let over = false
  const applied = new Map<string, number>()
  for (const app of apps) {
    const currencyId = String(app.currencyId)
    const next = (applied.get(currencyId) ?? 0) + (Number(app.minorAmount) || 0)
    applied.set(currencyId, next)
    if (next > (due.get(currencyId) ?? 0))
      over = true
  }
  if (!over)
    return

  for (const app of apps)
    await PaymentApplicationRepo.cancelById({ id: String(app._id), cancelledBy })
  for (const currencyId of applied.keys())
    await allocateCreditToProcurement(procurementId, currencyId)
}

export async function refreshPaymentStatus(procurementId: string): Promise<void> {
  const procurement = await ProcurementRepo.findById(procurementId)
  if (procurement === null || procurement.status === 'cancelled')
    return

  const { items: [row] } = await ProcurementRepo.list({
    filters: { seq: [procurement.seq] },
    sorters: {},
    pagination: { current: 1, pageSize: 1, full: false },
  })
  if (row === undefined)
    return

  await ProcurementRepo.updateById(procurementId, { paymentStatus: paymentStatusOf(row) })
}

export async function refreshOrderPaymentStatus(orderId: string): Promise<void> {
  const order = await OrderRepo.findById(orderId)
  if (order === null || order.removed === true)
    return

  const [itemMinors, applications] = await Promise.all([
    OrderRepo.sumItemMinorsByOrderIds([orderId]),
    PaymentApplicationRepo.sumActiveMinorsByDocumentIds([orderId]),
  ])
  const remainingByCurrency = new Map<string, number>()
  const paidByCurrency = new Map<string, number>()

  for (const row of itemMinors)
    remainingByCurrency.set(String(row.currencyId), Number(row.minorAmount) || 0)
  for (const row of applications) {
    const currencyId = String(row.currencyId)
    const paid = Number(row.minorAmount) || 0
    paidByCurrency.set(currencyId, paid)
    remainingByCurrency.set(currencyId, (remainingByCurrency.get(currencyId) ?? 0) - paid)
  }

  await OrderRepo.patchById({
    id: orderId,
    payload: { orderPaymentStatus: orderPaymentStatusOf(remainingByCurrency, paidByCurrency) },
  })
}

export async function withSettlement<T extends { id: string }>(
  items: T[],
): Promise<Array<T & PartySettlement>> {
  const settlements = await getSettlements(items.map(item => item.id))
  return items.map(item => ({
    ...item,
    debts: settlements.get(item.id)?.debts ?? [],
    payments: settlements.get(item.id)?.payments ?? [],
    balances: settlements.get(item.id)?.balances ?? [],
  }))
}

export async function withClientSettlement<T extends { id: string }>(
  items: T[],
): Promise<Array<T & PartySettlement>> {
  const settlements = await getClientSettlements(items.map(item => item.id))
  return items.map(item => ({
    ...item,
    debts: settlements.get(item.id)?.debts ?? [],
    payments: settlements.get(item.id)?.payments ?? [],
    balances: settlements.get(item.id)?.balances ?? [],
  }))
}
