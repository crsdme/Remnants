import type {
  AuthUser,
  CancelProcurementPaymentResponse,
  ConfirmProcurementResponse,
  CreateProcurementResponse,
  EditProcurementResponse,
  GetProcurementItemsResponse,
  GetProcurementsResponse,
  PayProcurementResponse,
  PaySupplierResponse,
  RemoveProcurementsResponse,
  ScanBarcodeProcurementResponse,
  UnconfirmProcurementResponse,
} from '@remnant/shared'
import type {
  CancelProcurementPaymentPayload,
  ConfirmProcurementPayload,
  CreateProcurementPayload,
  EditProcurementPayload,
  GetProcurementItemsPayload,
  GetProcurementsPayload,
  PayProcurementPayload,
  PaySupplierPayload,
  RemoveProcurementsPayload,
  ScanBarcodeProcurementPayload,
  UnconfirmProcurementPayload,
} from '@/types'
import * as CurrencyRepo from '@/repositories/currencies.repo'
import * as PaymentApplicationRepo from '@/repositories/payment-application.repo'
import * as ProcurementRepo from '@/repositories/procurement.repo'
import * as SupplierRepo from '@/repositories/supplier.repo'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import * as WarehouseTransactionRepo from '@/repositories/warehouse-transaction.repo'
import * as BarcodeService from '@/services/barcode.service'
import * as MoneyTransactionService from '@/services/money-transaction.service'
import * as Settlement from '@/services/settlement.service'
import * as StockLedger from '@/services/stock-ledger.service'
import { parseGetBarcodes } from '@/types/'
import { assertEntityInAccess, HttpError } from '@/utils/'
import { toMinor } from '@/utils/money'

export { receiveFromSupplier } from '@/services/stock-ledger.service'

export async function get({ payload }: { payload: GetProcurementsPayload }): Promise<GetProcurementsResponse> {
  const { items, total, page, pageSize } = await ProcurementRepo.list(payload)

  return {
    status: 'success',
    code: 'PROCUREMENTS_FETCHED',
    message: 'Procurements fetched',
    data: {
      items,
      pagination: { total, page, pageSize },
    },
  }
}

export async function getItems({ payload }: { payload: GetProcurementItemsPayload }): Promise<GetProcurementItemsResponse> {
  const { items, total, page, pageSize } = await ProcurementRepo.listItems(payload)

  return {
    status: 'success',
    code: 'PROCUREMENT_ITEMS_FETCHED',
    message: 'Procurement items fetched',
    data: {
      items,
      pagination: { total, page, pageSize },
    },
  }
}

export async function create({
  payload,
  user,
}: {
  payload: CreateProcurementPayload
  user: AuthUser
}): Promise<CreateProcurementResponse> {
  const procurement = await ProcurementRepo.createOne({
    supplierId: payload.supplierId,
    warehouseId: payload.warehouseId ?? null,
    comment: payload.comment,
    createdBy: user.id,
    status: 'draft',
    paymentStatus: 'unpaid',
    removed: false,
  })

  const items = []
  for (const item of payload.items) {
    const currency = await CurrencyRepo.findOne({ _id: item.purchaseCurrencyId.id })
    if (currency === null)
      throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

    items.push({
      procurementId: procurement._id,
      productId: item.id,
      quantity: item.quantity,
      receivedQuantity: 0,
      minorPurchasePrice: toMinor(item.purchasePrice, currency.scale),
      purchaseCurrencyId: item.purchaseCurrencyId.id,
    })
  }

  await ProcurementRepo.createItems(items)

  const { items: [created] } = await ProcurementRepo.list({
    filters: { seq: [procurement.seq] },
    sorters: {},
    pagination: { current: 1, pageSize: 1, full: false },
  })

  if (created === undefined)
    throw new HttpError(400, 'Procurement not created', 'PROCUREMENT_NOT_CREATED')

  return {
    status: 'success',
    code: 'PROCUREMENT_CREATED',
    message: 'Procurement created',
    data: created,
  }
}

export async function edit({
  payload,
  user,
}: {
  payload: EditProcurementPayload
  user: AuthUser
}): Promise<EditProcurementResponse> {
  const existing = await ProcurementRepo.findById(payload.id)
  if (existing === null)
    throw new HttpError(404, 'Procurement not found', 'PROCUREMENT_NOT_FOUND')

  if (payload.items !== undefined && existing.status !== 'draft')
    throw new HttpError(400, 'Only draft procurements can change items', 'PROCUREMENT_NOT_DRAFT')

  const procurement = await ProcurementRepo.updateById(payload.id, {
    comment: payload.comment,
    supplierId: payload.supplierId,
    status: payload.status,
    warehouseId: payload.warehouseId,
  })

  if (procurement === null)
    throw new HttpError(404, 'Procurement not found', 'PROCUREMENT_NOT_FOUND')

  if (payload.items !== undefined) {
    await ProcurementRepo.deleteItemsByProcurementId(payload.id)
    const items = []
    for (const item of payload.items) {
      const currency = await CurrencyRepo.findOne({ _id: item.purchaseCurrencyId.id })
      if (currency === null)
        throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

      items.push({
        procurementId: payload.id,
        productId: item.id,
        quantity: item.quantity,
        receivedQuantity: 0,
        minorPurchasePrice: toMinor(item.purchasePrice, currency.scale),
        purchaseCurrencyId: item.purchaseCurrencyId.id,
      })
    }
    await ProcurementRepo.createItems(items)
    await Settlement.reclaimOverallocatedProcurement(payload.id, user.id)
  }

  const updated = await loadProcurementRow(procurement.seq)
  return {
    status: 'success',
    code: 'PROCUREMENT_EDITED',
    message: 'Procurement edited',
    data: updated,
  }
}

export async function remove({ payload, user }: { payload: RemoveProcurementsPayload, user: AuthUser }): Promise<RemoveProcurementsResponse> {
  for (const id of payload.ids) {
    const procurement = await ProcurementRepo.findById(id)
    if (procurement === null)
      continue

    if (procurement.status === 'cancelled')
      continue

    await StockLedger.cancel({
      documentType: 'procurement',
      documentId: id,
      userId: user.id,
    })

    const inbound = await WarehouseTransactionRepo.findOne({
      sourceModel: 'procurement',
      sourceId: id,
      removed: { $ne: true },
    })
    if (inbound) {
      await StockLedger.cancel({
        documentType: 'warehouse-transaction',
        documentId: String(inbound._id),
        userId: user.id,
      })
      await WarehouseTransactionRepo.removeById(String(inbound._id), user.id)
    }

    await ProcurementRepo.updateById(id, {
      status: 'cancelled',
      removed: true,
      removedBy: user.id,
    })
  }

  return {
    status: 'success',
    code: 'PROCUREMENT_REMOVED',
    message: 'Procurement removed',
  }
}

export async function scanBarcode({ payload }: { payload: ScanBarcodeProcurementPayload }): Promise<ScanBarcodeProcurementResponse> {
  const { data: { items } } = await BarcodeService.get({
    payload: parseGetBarcodes({ filters: { codes: [payload.barcode] }, pagination: { full: true } }),
  })

  return {
    status: 'success',
    code: 'PROCUREMENT_ITEM_FETCHED',
    message: 'Procurement item fetched',
    item: items[0],
    procurementId: payload.procurementId,
  }
}

export async function pay({ payload, user }: { payload: PayProcurementPayload, user: AuthUser }): Promise<PayProcurementResponse> {
  const procurement = await ProcurementRepo.findById(payload.procurementId)
  if (procurement === null)
    throw new HttpError(404, 'Procurement not found', 'PROCUREMENT_NOT_FOUND')

  if (procurement.status === 'cancelled')
    throw new HttpError(400, 'Procurement is cancelled', 'PROCUREMENT_CANCELLED')

  const currency = await CurrencyRepo.findOne({ _id: payload.currency })
  if (currency === null)
    throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

  await Settlement.allocateCreditToProcurement(payload.procurementId, payload.currency)

  if (payload.amount !== undefined) {
    if (payload.cashregister == null || payload.cashregister === ''
      || payload.account == null || payload.account === '') {
      throw new HttpError(400, 'Cashregister and account are required', 'PROCUREMENT_PAYMENT_ACCOUNT_REQUIRED')
    }

    await MoneyTransactionService.createTransaction({
      payload: {
        type: 'procurement',
        direction: 'out',
        accountId: payload.account,
        cashregisterId: payload.cashregister,
        sourceModel: 'supplier',
        sourceId: procurement.supplierId,
        currencyId: payload.currency,
        amount: payload.amount,
        description: payload.comment,
      },
      user,
    })
    await Settlement.allocateCreditToProcurement(payload.procurementId, payload.currency)
  }

  return {
    status: 'success',
    code: 'PROCUREMENT_PAID',
    message: 'Procurement paid',
    data: await loadProcurementRow(procurement.seq),
  }
}

export async function cancelPayment({
  payload,
  user,
}: {
  payload: CancelProcurementPaymentPayload
  user: AuthUser
}): Promise<CancelProcurementPaymentResponse> {
  const application = await PaymentApplicationRepo.findById(payload.applicationId)
  if (application === null)
    throw new HttpError(404, 'Payment not found', 'PROCUREMENT_PAYMENT_NOT_FOUND')

  if (application.documentType !== 'procurement')
    throw new HttpError(400, 'Payment is not linked to a procurement', 'PROCUREMENT_PAYMENT_NOT_FOUND')

  if (application.cancelled === true)
    throw new HttpError(400, 'Payment is already cancelled', 'PROCUREMENT_PAYMENT_CANCELLED')

  const procurement = await ProcurementRepo.findById(application.documentId)
  if (procurement === null)
    throw new HttpError(404, 'Procurement not found', 'PROCUREMENT_NOT_FOUND')

  await PaymentApplicationRepo.cancelById({
    id: payload.applicationId,
    cancelledBy: user.id,
  })

  await refreshPaymentStatus(application.documentId)

  return {
    status: 'success',
    code: 'PROCUREMENT_PAYMENT_CANCELLED',
    message: 'Procurement payment cancelled',
    data: await loadProcurementRow(procurement.seq),
  }
}

export async function paySupplier({
  payload,
  user,
}: {
  payload: PaySupplierPayload
  user: AuthUser
}): Promise<PaySupplierResponse> {
  const supplier = await SupplierRepo.findById(payload.supplierId)
  if (supplier === null)
    throw new HttpError(404, 'Supplier not found', 'SUPPLIER_NOT_FOUND')

  const currency = await CurrencyRepo.findOne({ _id: payload.currency })
  if (currency === null)
    throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

  if (payload.amount !== undefined) {
    if (payload.cashregister == null || payload.cashregister === ''
      || payload.account == null || payload.account === '') {
      throw new HttpError(400, 'Cashregister and account are required', 'PROCUREMENT_PAYMENT_ACCOUNT_REQUIRED')
    }

    await MoneyTransactionService.createTransaction({
      payload: {
        type: 'procurement',
        direction: 'out',
        accountId: payload.account,
        cashregisterId: payload.cashregister,
        sourceModel: 'supplier',
        sourceId: payload.supplierId,
        currencyId: payload.currency,
        amount: payload.amount,
        description: payload.comment,
      },
      user,
    })
  }
  else {
    await Settlement.allocateCreditFifo(payload.supplierId, payload.currency)
  }

  const { items: refreshed } = await ProcurementRepo.list({
    filters: { supplierId: payload.supplierId },
    sorters: { createdAt: 'asc' },
    pagination: { current: 1, pageSize: 1, full: true },
  })

  return {
    status: 'success',
    code: 'SUPPLIER_PAID',
    message: 'Supplier paid',
    data: {
      items: refreshed.filter(item => item.status !== 'cancelled'),
      pagination: { total: refreshed.length, page: 1, pageSize: refreshed.length },
    },
  }
}

export async function confirm({
  payload,
  user,
}: {
  payload: ConfirmProcurementPayload
  user: AuthUser
}): Promise<ConfirmProcurementResponse> {
  const procurement = await ProcurementRepo.findById(payload.id)
  if (procurement === null)
    throw new HttpError(404, 'Procurement not found', 'PROCUREMENT_NOT_FOUND')

  if (procurement.status !== 'draft')
    throw new HttpError(400, 'Procurement is already confirmed', 'PROCUREMENT_ALREADY_CONFIRMED')

  const warehouseId = payload.warehouseId ?? procurement.warehouseId
  if (warehouseId === undefined)
    throw new HttpError(400, 'Warehouse is required to confirm procurement', 'PROCUREMENT_WAREHOUSE_REQUIRED')

  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const isAdmin = user.permissions.includes('other.admin')
  assertEntityInAccess(access, 'warehouses', warehouseId, { isAdmin })

  const existingInbound = await WarehouseTransactionRepo.findOne({
    sourceModel: 'procurement',
    sourceId: payload.id,
    removed: { $ne: true },
  })
  if (existingInbound)
    throw new HttpError(400, 'Procurement inbound already exists', 'PROCUREMENT_ALREADY_CONFIRMED')

  const items = await ProcurementRepo.listItemsByProcurementId(payload.id)
  if (items.length === 0)
    throw new HttpError(400, 'Procurement has no items', 'PROCUREMENT_ITEMS_REQUIRED')

  const inbound = await WarehouseTransactionRepo.createOne({
    type: 'in',
    toWarehouseId: warehouseId,
    requiresReceiving: true,
    status: 'awaiting',
    comment: procurement.comment,
    createdBy: user.id,
    sourceModel: 'procurement',
    sourceId: payload.id,
  })

  await WarehouseTransactionRepo.createItems(items.map(item => ({
    transactionId: String(inbound._id),
    productId: String(item.productId),
    quantity: Number(item.quantity),
    receivedQuantity: 0,
    minorPurchasePrice: Number(item.minorPurchasePrice) || 0,
    purchaseCurrencyId: String(item.purchaseCurrencyId),
  })))

  await ProcurementRepo.updateById(payload.id, {
    warehouseId,
    status: 'ordered',
  })

  const { items: [confirmed] } = await ProcurementRepo.list({
    filters: { seq: [procurement.seq] },
    sorters: {},
    pagination: { current: 1, pageSize: 1, full: false },
  })

  if (confirmed === undefined)
    throw new HttpError(404, 'Procurement not found', 'PROCUREMENT_NOT_FOUND')

  return {
    status: 'success',
    code: 'PROCUREMENT_CONFIRMED',
    message: 'Procurement confirmed',
    data: confirmed,
  }
}

export async function unconfirm({
  payload,
  user,
}: {
  payload: UnconfirmProcurementPayload
  user: AuthUser
}): Promise<UnconfirmProcurementResponse> {
  const procurement = await ProcurementRepo.findById(payload.id)
  if (procurement === null)
    throw new HttpError(404, 'Procurement not found', 'PROCUREMENT_NOT_FOUND')

  if (procurement.status === 'draft')
    throw new HttpError(400, 'Procurement is not confirmed', 'PROCUREMENT_NOT_CONFIRMED')

  if (procurement.status === 'cancelled')
    throw new HttpError(400, 'Procurement is cancelled', 'PROCUREMENT_CANCELLED')

  const inbound = await WarehouseTransactionRepo.findOne({
    sourceModel: 'procurement',
    sourceId: payload.id,
    removed: { $ne: true },
  })

  if (inbound) {
    const inboundItems = await WarehouseTransactionRepo.listItemsByTransactionId(String(inbound._id))
    const hasReceived = inboundItems.some(item => (Number(item.receivedQuantity) || 0) > 0)
    if (hasReceived)
      throw new HttpError(400, 'Procurement already has received stock', 'PROCUREMENT_ALREADY_RECEIVED')

    await WarehouseTransactionRepo.removeById(String(inbound._id), user.id)
  }

  await ProcurementRepo.updateById(payload.id, { status: 'draft' })

  const { items: [draft] } = await ProcurementRepo.list({
    filters: { seq: [procurement.seq] },
    sorters: {},
    pagination: { current: 1, pageSize: 1, full: false },
  })

  if (draft === undefined)
    throw new HttpError(404, 'Procurement not found', 'PROCUREMENT_NOT_FOUND')

  return {
    status: 'success',
    code: 'PROCUREMENT_UNCONFIRMED',
    message: 'Procurement confirmation withdrawn',
    data: draft,
  }
}

export async function applyInboundReceipt({
  procurementId,
  products,
}: {
  procurementId: string
  products: Array<{ productId: string, receivedQuantity: number }>
}): Promise<void> {
  const items = await ProcurementRepo.listItemsByProcurementId(procurementId)
  const itemsByProduct = new Map(items.map(item => [String(item.productId), item]))

  for (const product of products) {
    if (product.receivedQuantity <= 0)
      continue

    const item = itemsByProduct.get(product.productId)
    if (!item)
      throw new HttpError(400, 'Procurement item not found', 'PROCUREMENT_ITEM_NOT_FOUND')

    await ProcurementRepo.updateItemReceived({
      procurementId,
      productId: product.productId,
      receivedQuantity: product.receivedQuantity,
    })
  }

  await refreshReceiptStatus(procurementId)
}

export async function reverseInboundReceipt({
  procurementId,
  products,
}: {
  procurementId: string
  products: Array<{ productId: string, receivedQuantity: number }>
}): Promise<void> {
  const items = await ProcurementRepo.listItemsByProcurementId(procurementId)
  const itemsByProduct = new Map(items.map(item => [String(item.productId), item]))

  for (const product of products) {
    if (product.receivedQuantity <= 0)
      continue

    const item = itemsByProduct.get(product.productId)
    if (!item)
      continue

    const next = Math.max(0, (Number(item.receivedQuantity) || 0) - product.receivedQuantity)
    await ProcurementRepo.setItemReceived({
      procurementId,
      productId: product.productId,
      receivedQuantity: next,
    })
  }

  await refreshReceiptStatus(procurementId)
}

async function refreshReceiptStatus(procurementId: string) {
  const procurement = await ProcurementRepo.findById(procurementId)
  if (procurement === null || procurement.status === 'cancelled')
    return

  const items = await ProcurementRepo.listItemsByProcurementId(procurementId)
  const totalOrdered = items.reduce((sum, item) => sum + Number(item.quantity), 0)
  const totalReceived = items.reduce((sum, item) => sum + Math.max(0, Number(item.receivedQuantity) || 0), 0)

  const nextStatus = totalReceived <= 0
    ? 'ordered'
    : totalReceived >= totalOrdered
      ? 'received'
      : 'partially-received'

  await ProcurementRepo.updateById(procurementId, { status: nextStatus })
}

async function loadProcurementRow(seq: number) {
  const { items: [row] } = await ProcurementRepo.list({
    filters: { seq: [seq] },
    sorters: {},
    pagination: { current: 1, pageSize: 1, full: false },
  })

  if (row === undefined)
    throw new HttpError(404, 'Procurement not found', 'PROCUREMENT_NOT_FOUND')

  return row
}

async function refreshPaymentStatus(procurementId: string) {
  await Settlement.refreshPaymentStatus(procurementId)
}
