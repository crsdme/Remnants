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
import * as UserAccessRepo from '@/repositories/user-access.repo'
import * as WarehouseTransactionRepo from '@/repositories/warehouse-transaction.repo'
import * as BarcodeService from '@/services/barcode.service'
import * as QuantityService from '@/services/quantity.service'
import { parseGetBarcodes, parseGetWarehouseTransactions, parseGetWarehouseTransactionsItems } from '@/types/'
import { getScopeIdsForUser } from '@/utils'
import { HttpError } from '@/utils/httpError'

export async function get({
  payload,
  user,
}: {
  payload: GetWarehouseTransactionsPayload
  user: AuthUser
}): Promise<GetWarehouseTransactionsResponse> {
  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const warehouseIds = getScopeIdsForUser(access, 'warehouseIds', user)

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

    const { items: warehouseTransactionItems } = await WarehouseTransactionRepo.listItems(parseGetWarehouseTransactionsItems(
      { filters: { transactionId: id }, pagination: { full: true } },
    ))

    if (warehouseTransaction === null)
      throw new HttpError(404, 'Warehouse transaction not found', 'WAREHOUSE_TRANSACTION_NOT_FOUND')

    switch (warehouseTransaction.type) {
      case 'in':
        for (const item of warehouseTransactionItems) {
          await QuantityService.count({
            payload: {
              mode: 'dec',
              productId: item.productId,
              warehouseId: warehouseTransaction.toWarehouseId,
              count: item.quantity,
              userId: user.id,
              refType: 'warehouse-transaction',
              refId: id,
            },
          })
        }
        break
      case 'out':
        for (const item of warehouseTransactionItems) {
          await QuantityService.count({
            payload: {
              mode: 'inc',
              productId: item.productId,
              warehouseId: warehouseTransaction.fromWarehouseId,
              count: item.quantity,
              userId: user.id,
              refType: 'warehouse-transaction',
              refId: id,
            },
          })
        }
        break
      case 'transfer':
        for (const item of warehouseTransactionItems) {
          await QuantityService.count({
            payload: {
              mode: 'inc',
              productId: item.productId,
              warehouseId: warehouseTransaction.fromWarehouseId,
              count: item.quantity,
              userId: user.id,
              refType: 'warehouse-transaction',
              refId: id,
            },
          })
          if (warehouseTransaction.status === 'received') {
            await QuantityService.count({
              payload: {
                mode: 'dec',
                productId: item.productId,
                warehouseId: warehouseTransaction.toWarehouseId,
                count: item.quantity,
                userId: user.id,
                refType: 'warehouse-transaction',
                refId: id,
              },
            })
          }
        }
        break
    }

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

  const warehouseTransaction = await WarehouseTransactionRepo.createOne({
    type,
    toWarehouseId,
    comment,
    createdBy: user.id,
    status: 'confirmed',
    products,
  })

  const mappedProducts = products.map(product => ({
    transactionId: warehouseTransaction._id,
    productId: product.id,
    quantity: product.quantity,
  }))

  for (const product of mappedProducts) {
    await WarehouseTransactionRepo.createItems(mappedProducts)
    await QuantityService.count({
      payload: {
        mode: 'inc',
        userId: user.id,
        refType: 'warehouse',
        refId: warehouseTransaction._id.toString(),
        productId: product.productId,
        warehouseId: toWarehouseId,
        count: product.quantity,
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

  const warehouseTransaction = await WarehouseTransactionRepo.createOne({
    type,
    fromWarehouseId,
    comment,
    createdBy: user.id,
    status: 'confirmed',
    products,
  })

  const mappedProducts = products.map(product => ({
    transactionId: warehouseTransaction._id,
    productId: product.id,
    quantity: product.quantity,
  }))

  for (const product of mappedProducts) {
    await QuantityService.count({
      payload: {
        mode: 'dec',
        userId: user.id,
        productId: product.productId,
        warehouseId: fromWarehouseId,
        count: product.quantity,
        refType: 'warehouse',
        refId: warehouseTransaction._id.toString(),
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

  const warehouseTransaction = await WarehouseTransactionRepo.createOne({
    type,
    fromWarehouseId,
    toWarehouseId,
    requiresReceiving,
    products,
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
    await QuantityService.count({
      payload: {
        mode: 'dec',
        productId: product.productId,
        warehouseId: fromWarehouseId,
        count: product.quantity,
        userId: user.id,
        refType: 'warehouse',
        refId: warehouseTransaction._id.toString(),
      },
    })

    if (!requiresReceiving) {
      await QuantityService.count({
        payload: {
          mode: 'inc',
          productId: product.productId,
          warehouseId: toWarehouseId,
          count: product.quantity,
          userId: user.id,
          refType: 'warehouse',
          refId: warehouseTransaction._id.toString(),
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

  if (warehouseTransaction.toWarehouseId) {
    for (const product of mappedProducts) {
      await QuantityService.count({
        payload: {
          mode: 'inc',
          productId: product.productId,
          warehouseId: warehouseTransaction.toWarehouseId,
          count: product.receivedQuantity,
          userId: user.id,
          refType: 'warehouse-transaction',
          refId: id,
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
