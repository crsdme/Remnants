import type {
  AuthUser,
  CreateWarehouseTransactionResponse,
  EditWarehouseTransactionResponse,
  GetWarehouseTransactionDetailsResponse,
  GetWarehouseTransactionsItemsResponse,
  GetWarehouseTransactionsResponse,
  ReceiveWarehouseTransactionResponse,
  RemoveWarehouseTransactionsResponse,
  ScanBarcodeToDraftResponse,
} from '@remnant/shared'
import type {
  CreateWarehouseTransactionPayload,
  EditWarehouseTransactionPayload,
  GetWarehouseTransactionDetailsPayload,
  GetWarehouseTransactionsItemsPayload,
  GetWarehouseTransactionsPayload,
  ReceiveWarehouseTransactionPayload,
  RemoveWarehouseTransactionsPayload,
  ScanBarcodeToDraftPayload,
} from '@/types/'
import { mapWarehouseTransactionItemRepoToDTO } from '@/mappers/warehouse-transaction.mapper'
import * as ProcurementRepo from '@/repositories/procurement.repo'
import * as ProductsRepository from '@/repositories/products.repo'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import * as WarehouseTransactionRepo from '@/repositories/warehouse-transaction.repo'
import * as BarcodeService from '@/services/barcode.service'
import * as ProcurementService from '@/services/procurement.service'
import * as StockLedger from '@/services/stock-ledger.service'
import { parseGetBarcodes, parseGetWarehouseTransactions, parseGetWarehouseTransactionsItems } from '@/types/'
import { assertEntityCapability, assertEntityInAccess, getEntityIdsForUser } from '@/utils'
import { HttpError } from '@/utils/httpError'

export async function get({
  payload,
  user,
}: {
  payload: GetWarehouseTransactionsPayload
  user: AuthUser
}): Promise<GetWarehouseTransactionsResponse> {
  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const warehouseIds = getEntityIdsForUser(access, 'warehouses', user)

  const { items, total, page, pageSize } = await WarehouseTransactionRepo.list(payload, { warehouseIds })

  return {
    status: 'success',
    code: 'WAREHOUSE_TRANSACTIONS_FETCHED',
    message: 'Warehouse transactions fetched',
    data: {
      items,
      pagination: {
        total,
        page,
        pageSize,
      },
    },
  }
}

export async function getItems({ payload }: { payload: GetWarehouseTransactionsItemsPayload }): Promise<GetWarehouseTransactionsItemsResponse> {
  const { items, total, page, pageSize } = await WarehouseTransactionRepo.listItems(payload)

  const mappedItems = items.map(mapWarehouseTransactionItemRepoToDTO)

  return {
    status: 'success',
    code: 'WAREHOUSE_TRANSACTIONS_ITEMS_FETCHED',
    message: 'Warehouse transactions items fetched',
    data: {
      items: mappedItems,
      pagination: {
        total,
        page,
        pageSize,
      },
    },
  }
}

export async function getDetails({ payload }: { payload: GetWarehouseTransactionDetailsPayload }): Promise<GetWarehouseTransactionDetailsResponse> {
  const { items: [warehouseTransaction] } = await WarehouseTransactionRepo.list(parseGetWarehouseTransactions(
    { filters: payload, pagination: { full: true } },
  ))

  if (warehouseTransaction === undefined)
    throw new HttpError(404, 'Warehouse transaction not found', 'WAREHOUSE_TRANSACTION_NOT_FOUND')

  // const { items: warehouseTransactionItems } = await WarehouseTransactionRepo.listItems(parseGetWarehouseTransactionsItems(
  //   { filters: { transactionId: warehouseTransaction.id }, pagination: { full: true } },
  // ))

  const { data: { items: warehouseTransactionItems } } = await getItems({
    payload: parseGetWarehouseTransactionsItems({ filters: { transactionId: warehouseTransaction.id }, pagination: { full: true } }),
  })

  return {
    status: 'success',
    code: 'WAREHOUSE_TRANSACTION_DETAILS_FETCHED',
    message: 'Warehouse transaction details fetched',
    data: {
      warehouseTransaction,
      warehouseTransactionItems,
    },
  }
}

export async function scanBarcodeToDraft({ payload }: { payload: ScanBarcodeToDraftPayload }): Promise<ScanBarcodeToDraftResponse> {
  const { barcode, transactionId } = payload

  const { data: { items } } = await BarcodeService.get({ payload: parseGetBarcodes({ filters: { codes: [barcode] }, pagination: { full: true } }) })

  return {
    status: 'success',
    code: 'WAREHOUSE_ITEM_FETCHED',
    message: 'Warehouse item fetched',
    item: items[0],
    transactionId,
  }
}

export async function create({ payload, user }: { payload: CreateWarehouseTransactionPayload, user: AuthUser }): Promise<CreateWarehouseTransactionResponse> {
  switch (payload.type) {
    case 'in':
      return inWarehauseTransaction({ payload, user })
    case 'out':
      return outWarehauseTransaction({ payload, user })
    case 'transfer':
      return transferWarehauseTransaction({ payload, user })
    default:
      throw new HttpError(400, 'Money transaction type not supported', 'MONEY_TRANSACTION_TYPE_NOT_SUPPORTED')
  }
}

export async function edit({ payload }: { payload: EditWarehouseTransactionPayload }): Promise<EditWarehouseTransactionResponse> {
  const warehouseTransaction = await WarehouseTransactionRepo.updateById(payload.id, payload)

  if (warehouseTransaction === null)
    throw new HttpError(400, 'Warehouse transaction not edited', 'WAREHOUSE_TRANSACTION_NOT_EDITED')

  return {
    status: 'success',
    code: 'WAREHOUSE_TRANSACTION_EDITED',
    message: 'Warehouse transaction edited',
  }
}

export async function remove({ payload, user }: { payload: RemoveWarehouseTransactionsPayload, user: AuthUser }): Promise<RemoveWarehouseTransactionsResponse> {
  for (const id of payload.ids) {
    const warehouseTransaction = await WarehouseTransactionRepo.findById(id)

    if (warehouseTransaction === null)
      throw new HttpError(404, 'Warehouse transaction not found', 'WAREHOUSE_TRANSACTION_NOT_FOUND')

    if (warehouseTransaction.sourceModel === 'procurement' && typeof warehouseTransaction.sourceId === 'string') {
      const inboundItems = await WarehouseTransactionRepo.listItemsByTransactionId(id)
      await ProcurementService.reverseInboundReceipt({
        procurementId: warehouseTransaction.sourceId,
        products: inboundItems.map(item => ({
          productId: String(item.productId),
          receivedQuantity: Number(item.receivedQuantity) || 0,
        })),
      })
    }

    await StockLedger.cancel({
      documentType: 'warehouse-transaction',
      documentId: id,
      userId: user.id,
    })

    await WarehouseTransactionRepo.removeById(id, user.id)
  }

  return {
    status: 'success',
    code: 'WAREHOUSE_TRANSACTION_REMOVED',
    message: 'Warehouse transaction removed',
  }
}

type PayloadByType<T extends CreateWarehouseTransactionPayload['type']>
  = Extract<CreateWarehouseTransactionPayload, { type: T }>

async function inWarehauseTransaction({ payload, user }: { payload: PayloadByType<'in'>, user: AuthUser }): Promise<CreateWarehouseTransactionResponse> {
  const { type, toWarehouseId, comment, products } = payload

  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const isAdmin = user.permissions.includes('other.admin')
  assertEntityInAccess(access, 'warehouses', toWarehouseId, { isAdmin })

  const warehouseTransaction = await WarehouseTransactionRepo.createOne({
    type,
    toWarehouseId,
    comment,
    createdBy: user.id,
    status: 'confirmed',
    requiresReceiving: false,
  })

  const mappedProducts = products.map(product => ({
    transactionId: warehouseTransaction._id,
    productId: product.id,
    quantity: product.quantity,
  }))

  await WarehouseTransactionRepo.createItems(mappedProducts)

  for (const product of products) {
    const productDoc = await ProductsRepository.findById(product.id)
    const lineCost = product.minorPurchasePrice !== undefined && typeof product.purchaseCurrencyId === 'string'
      ? {
          minorUnitCost: product.minorPurchasePrice,
          currencyId: product.purchaseCurrencyId,
        }
      : productDoc
        ? {
            minorUnitCost: productDoc.minorPurchasePrice,
            currencyId: productDoc.purchaseCurrencyId,
          }
        : undefined

    await StockLedger.post({
      payload: {
        fromKind: 'adjustment',
        toKind: 'warehouse',
        toWarehouseId,
        productId: product.id,
        quantity: product.quantity,
        documentType: 'warehouse-transaction',
        documentId: warehouseTransaction._id,
        userId: user.id,
        inboundCost: lineCost,
      },
    })
  }

  return {
    status: 'success',
    code: 'WAREHOUSE_TRANSACTION_CREATED',
    message: 'Warehouse transaction created',
  }
}

async function outWarehauseTransaction({ payload, user }: { payload: PayloadByType<'out'>, user: AuthUser }): Promise<CreateWarehouseTransactionResponse> {
  const { type, fromWarehouseId, comment, products } = payload

  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const isAdmin = user.permissions.includes('other.admin')
  assertEntityCapability(access, 'warehouses', fromWarehouseId, 'transfer', { isAdmin })

  const warehouseTransaction = await WarehouseTransactionRepo.createOne({
    type,
    fromWarehouseId,
    comment,
    createdBy: user.id,
    status: 'confirmed',
    requiresReceiving: false,
  })

  const mappedProducts = products.map(product => ({
    transactionId: warehouseTransaction._id,
    productId: product.id,
    quantity: product.quantity,
  }))

  await WarehouseTransactionRepo.createItems(mappedProducts)

  for (const product of mappedProducts) {
    await StockLedger.post({
      payload: {
        fromKind: 'warehouse',
        fromWarehouseId,
        toKind: 'adjustment',
        productId: product.productId,
        quantity: product.quantity,
        documentType: 'warehouse-transaction',
        documentId: warehouseTransaction._id,
        userId: user.id,
      },
    })
  }

  return {
    status: 'success',
    code: 'WAREHOUSE_TRANSACTION_CREATED',
    message: 'Warehouse transaction created',
  }
}

async function transferWarehauseTransaction({ payload, user }: { payload: PayloadByType<'transfer'>, user: AuthUser }): Promise<CreateWarehouseTransactionResponse> {
  const { type, fromWarehouseId, toWarehouseId, requiresReceiving, comment, products } = payload

  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const isAdmin = user.permissions.includes('other.admin')
  assertEntityCapability(access, 'warehouses', fromWarehouseId, 'transfer', { isAdmin })
  assertEntityInAccess(access, 'warehouses', toWarehouseId, { isAdmin })

  const warehouseTransaction = await WarehouseTransactionRepo.createOne({
    type,
    fromWarehouseId,
    toWarehouseId,
    requiresReceiving,
    comment,
    createdBy: user.id,
    status: requiresReceiving ? 'awaiting' : 'confirmed',
  })

  const mappedProducts = products.map(product => ({
    transactionId: warehouseTransaction._id,
    productId: product.id,
    quantity: product.quantity,
  }))

  for (const product of mappedProducts) {
    if (requiresReceiving) {
      await StockLedger.post({
        payload: {
          fromKind: 'warehouse',
          fromWarehouseId,
          toKind: 'transit',
          productId: product.productId,
          quantity: product.quantity,
          documentType: 'warehouse-transaction',
          documentId: warehouseTransaction._id,
          userId: user.id,
        },
      })
    }
    else {
      await StockLedger.post({
        payload: {
          fromKind: 'warehouse',
          fromWarehouseId,
          toKind: 'warehouse',
          toWarehouseId,
          productId: product.productId,
          quantity: product.quantity,
          documentType: 'warehouse-transaction',
          documentId: warehouseTransaction._id,
          userId: user.id,
        },
      })
    }
  }

  await WarehouseTransactionRepo.createItems(mappedProducts)

  return {
    status: 'success',
    code: 'WAREHOUSE_TRANSACTION_CREATED',
    message: 'Warehouse transaction created',
  }
}

export async function receive({ payload, user }: { payload: ReceiveWarehouseTransactionPayload, user: AuthUser }): Promise<ReceiveWarehouseTransactionResponse> {
  const { id, products } = payload
  const acceptedBy = user.id

  const existing = await WarehouseTransactionRepo.findById(id)
  if (existing === null)
    throw new HttpError(404, 'Warehouse transaction not found', 'WAREHOUSE_TRANSACTION_NOT_FOUND')

  if (existing.status !== 'awaiting')
    throw new HttpError(400, 'Warehouse transaction is not awaiting receipt', 'WAREHOUSE_TRANSACTION_NOT_AWAITING')

  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const isAdmin = user.permissions.includes('other.admin')

  if (existing.type === 'in' && existing.sourceModel === 'procurement' && typeof existing.sourceId === 'string') {
    const inboundWarehouseId = payload.toWarehouseId ?? existing.toWarehouseId
    if (typeof inboundWarehouseId !== 'string')
      throw new HttpError(400, 'Inbound warehouse is required', 'WAREHOUSE_TRANSACTION_WAREHOUSE_REQUIRED')

    assertEntityCapability(access, 'warehouses', inboundWarehouseId, 'receive', { isAdmin })
    return receiveProcurementInbound({ existing, products, toWarehouseId: inboundWarehouseId, userId: acceptedBy })
  }

  assertEntityCapability(access, 'warehouses', existing.toWarehouseId, 'receive', { isAdmin })

  const warehouseTransaction = await WarehouseTransactionRepo.updateById(id, {
    status: 'received',
    acceptedBy,
    acceptedAt: new Date(),
    accepted: true,
  })

  if (warehouseTransaction === null)
    throw new HttpError(404, 'Warehouse transaction not found', 'WAREHOUSE_TRANSACTION_NOT_FOUND')

  const mappedProducts = products.map(product => ({
    transactionId: id,
    productId: product.id,
    quantity: product.quantity,
    receivedQuantity: product.receivedQuantity,
  }))

  if (warehouseTransaction.toWarehouseId !== undefined) {
    for (const product of mappedProducts) {
      if (product.receivedQuantity <= 0)
        continue

      await StockLedger.post({
        payload: {
          fromKind: 'transit',
          toKind: 'warehouse',
          toWarehouseId: warehouseTransaction.toWarehouseId,
          productId: product.productId,
          quantity: product.receivedQuantity,
          documentType: 'warehouse-transaction',
          documentId: id,
          userId: user.id,
        },
      })
    }
  }

  for (const product of mappedProducts) {
    await WarehouseTransactionRepo.updateItem({
      payload: {
        receivedQuantity: product.receivedQuantity,
      },
      query: {
        transactionId: id,
        productId: product.productId,
      },
    })
  }

  return {
    status: 'success',
    code: 'WAREHOUSE_TRANSACTION_RECEIVED',
    message: 'Warehouse transaction received',
  }
}

async function receiveProcurementInbound({
  existing,
  products,
  toWarehouseId,
  userId,
}: {
  existing: NonNullable<Awaited<ReturnType<typeof WarehouseTransactionRepo.findById>>>
  products: ReceiveWarehouseTransactionPayload['products']
  toWarehouseId: string
  userId: string
}): Promise<ReceiveWarehouseTransactionResponse> {
  const id = String(existing._id)

  const wtItems = await WarehouseTransactionRepo.listItemsByTransactionId(id)
  const alreadyPosted = wtItems.some(item => (Number(item.receivedQuantity) || 0) > 0)
  if (alreadyPosted && typeof existing.toWarehouseId === 'string' && existing.toWarehouseId !== toWarehouseId)
    throw new HttpError(400, 'Warehouse cannot be changed after receipt', 'WAREHOUSE_TRANSACTION_WAREHOUSE_LOCKED')

  if (existing.toWarehouseId !== toWarehouseId) {
    await WarehouseTransactionRepo.updateById(id, { toWarehouseId })
    if (typeof existing.sourceId === 'string')
      await ProcurementRepo.updateById(existing.sourceId, { warehouseId: toWarehouseId })
  }

  const wtByProduct = new Map(wtItems.map(item => [String(item.productId), item]))
  const received: Array<{ productId: string, receivedQuantity: number }> = []

  for (const product of products) {
    if (product.receivedQuantity <= 0)
      continue

    const wtItem = wtByProduct.get(product.id)
    if (!wtItem)
      throw new HttpError(400, 'Warehouse transaction item not found', 'WAREHOUSE_TRANSACTION_ITEM_NOT_FOUND')

    const alreadyReceived = Number(wtItem.receivedQuantity) || 0

    await StockLedger.receiveFromSupplier({
      payload: {
        toWarehouseId,
        productId: product.id,
        quantity: product.receivedQuantity,
        documentType: 'warehouse-transaction',
        documentId: id,
        documentItemId: String(wtItem._id),
        userId,
        inboundCost: {
          minorUnitCost: Number(wtItem.minorPurchasePrice) || 0,
          currencyId: String(wtItem.purchaseCurrencyId),
        },
      },
    })

    await WarehouseTransactionRepo.updateItem({
      payload: { receivedQuantity: alreadyReceived + product.receivedQuantity },
      query: { transactionId: id, productId: product.id },
    })

    received.push({ productId: product.id, receivedQuantity: product.receivedQuantity })
  }

  if (typeof existing.sourceId === 'string')
    await ProcurementService.applyInboundReceipt({ procurementId: existing.sourceId, products: received })

  await WarehouseTransactionRepo.updateById(id, {
    status: 'received',
    acceptedBy: userId,
    acceptedAt: new Date(),
    accepted: true,
  })

  return {
    status: 'success',
    code: 'WAREHOUSE_TRANSACTION_RECEIVED',
    message: 'Warehouse transaction received',
  }
}
