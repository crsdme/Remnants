import type {
  AuthUser,
  CreateWarehouseTransactionResponse,
  EditWarehouseTransactionResponse,
  GetWarehouseTransactionsItemsResponse,
  GetWarehouseTransactionsResponse,
  ReceiveWarehouseTransactionResponse,
  RemoveWarehouseTransactionsResponse,
  ScanBarcodeToDraftWTResponse,
} from '@remnant/shared'
import type {
  CreateWarehouseTransactionPayload,
  EditWarehouseTransactionPayload,
  GetWarehouseTransactionsItemsPayload,
  GetWarehouseTransactionsPayload,
  ReceiveWarehouseTransactionPayload,
  RemoveWarehouseTransactionsPayload,
  ScanBarcodeToDraftPayload,
} from '@/types/'
import { mapWarehouseTransactionToDTO } from '@/mappers/'
import * as BarcodeRepo from '@/repositories/barcodes.repo'
import * as WarehouseTransactionRepo from '@/repositories/warehouse-transaction.repo'
import * as QuantityService from '@/services/quantity.service'
import { parseGetBarcodes } from '@/types/'
import { HttpError } from '@/utils/httpError'

export async function get({ payload }: { payload: GetWarehouseTransactionsPayload }): Promise<GetWarehouseTransactionsResponse> {
  const { items, total, page, pageSize } = await WarehouseTransactionRepo.list(payload)

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

  // warehouseTransactionsItems = warehouseTransactionsItems.map((item: any) => ({
  //   ...item,
  //   product: {
  //     ...item.product,
  //     images: item.product.images.map((image: any) => ({
  //       id: image._id,
  //       path: `${STORAGE_URLS.productImages}/${image.filename}`,
  //       filename: image.filename,
  //       name: image.name,
  //       type: image.type,
  //     })),
  //   },
  // }))

  return {
    status: 'success',
    code: 'WAREHOUSE_TRANSACTIONS_ITEMS_FETCHED',
    message: 'Warehouse transactions items fetched',
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

export async function scanBarcodeToDraft({ payload }: { payload: ScanBarcodeToDraftPayload }): Promise<ScanBarcodeToDraftWTResponse> {
  const { barcode, transactionId } = payload

  const { items } = await BarcodeRepo.list(parseGetBarcodes({ filters: { codes: [barcode] }, pagination: { full: true } }))

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
    data: mapWarehouseTransactionToDTO(warehouseTransaction),
  }
}

export async function remove({ payload, user }: { payload: RemoveWarehouseTransactionsPayload, user: AuthUser }): Promise<RemoveWarehouseTransactionsResponse> {
  for (const id of payload.ids) {
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
  const { type, toWarehouse, comment, products } = payload

  const warehouseTransaction = await WarehouseTransactionRepo.createOne({
    type,
    toWarehouse,
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
        mode: 'inc',
        userId: user.id,
        refType: 'warehouse',
        refId: warehouseTransaction._id.toString(),
        productId: product.productId,
        warehouse: toWarehouse,
        count: product.quantity,
      },
    })
  }

  return {
    status: 'success',
    code: 'WAREHOUSE_TRANSACTION_CREATED',
    message: 'Warehouse transaction created',
    data: mapWarehouseTransactionToDTO(warehouseTransaction),
  }
}

async function outWarehauseTransaction({ payload, user }: { payload: PayloadByType<'out'>, user: AuthUser }): Promise<CreateWarehouseTransactionResponse> {
  const { type, fromWarehouse, comment, products } = payload

  const warehouseTransaction = await WarehouseTransactionRepo.createOne({
    type,
    fromWarehouse,
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
        warehouse: fromWarehouse,
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
    data: mapWarehouseTransactionToDTO(warehouseTransaction),
  }
}

async function transferWarehauseTransaction({ payload, user }: { payload: PayloadByType<'transfer'>, user: AuthUser }): Promise<CreateWarehouseTransactionResponse> {
  const { type, fromWarehouse, toWarehouse, requiresReceiving, comment, products } = payload

  const warehouseTransaction = await WarehouseTransactionRepo.createOne({
    type,
    fromWarehouse,
    toWarehouse,
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
        warehouse: fromWarehouse,
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
          warehouse: toWarehouse,
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
    data: mapWarehouseTransactionToDTO(warehouseTransaction),
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

  if (warehouseTransaction.toWarehouse) {
    for (const product of mappedProducts) {
      await QuantityService.count({
        payload: {
          mode: 'inc',
          productId: product.productId,
          warehouse: warehouseTransaction.toWarehouse,
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
    data: mapWarehouseTransactionToDTO(warehouseTransaction),
  }
}
