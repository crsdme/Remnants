import type {
  AuthUser,
  CreateInventoryResponse,
  EditInventoryResponse,
  GetInventoriesResponse,
  GetInventoryItemsResponse,
  RemoveInventoriesResponse,
  ScanBarcodeToDraftResponse,
} from '@remnant/shared'
import type {
  CreateInventoriesPayload,
  EditInventoriesPayload,
  GetInventoriesPayload,
  GetInventoryItemsPayload,
  RemoveInventoriesPayload,
  ScanBarcodeToDraftInventoryPayload,
} from '@/types/'
import { v4 as uuidv4 } from 'uuid'
import { mapInventoryToDTO } from '@/mappers'
import * as InventoryRepo from '@/repositories/inventory.repo'
import * as ProductService from '@/services/product.service'
import * as QuantityService from '@/services/quantity.service'
import {
  parseGetProducts,
  parseGetProductsIndex,
} from '@/types/'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetInventoriesPayload }): Promise<GetInventoriesResponse> {
  const { items, total, page, pageSize } = await InventoryRepo.list({ payload })

  return {
    status: 'success',
    code: 'INVENTORIES_FETCHED',
    message: 'Inventories fetched',
    data: {
      items,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function getItems({ payload }: { payload: GetInventoryItemsPayload }): Promise<GetInventoryItemsResponse> {
  const { items, total, page, pageSize } = await InventoryRepo.listItems({ payload })

  // inventoryItems = inventoryItems.map((item: any) => ({
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
    code: 'INVENTORY_ITEMS_FETCHED',
    message: 'Inventory items fetched',
    data: {
      items,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function scanBarcodeToDraft({ payload }: { payload: ScanBarcodeToDraftInventoryPayload }): Promise<ScanBarcodeToDraftResponse> {
  const { barcode, category } = payload

  const { data: { items: [product] } } = await ProductService.get({
    payload: parseGetProducts({ filters: { codes: [barcode] }, pagination: { full: true } }),
  })

  const { productIndex } = await ProductService.getIndex({
    payload: parseGetProductsIndex({ productId: product.id, filters: { categories: [category] } }),
  })

  return {
    status: 'success',
    code: 'INVENTORY_ITEMS_FETCHED',
    message: 'Inventory items fetched',
    product,
    productIndex,
  }
}

export async function create({ payload, user }: { payload: CreateInventoriesPayload, user: AuthUser }): Promise<CreateInventoryResponse> {
  const { warehouse, categories, comment, items } = payload
  const createdBy = user.id
  const inventoryId = uuidv4()

  const { data: { items: products } } = await ProductService.get({
    payload: parseGetProducts({ filters: { categories }, pagination: { full: true } }),
  })

  const [inventory] = await InventoryRepo.create({
    payload: {
      _id: inventoryId,
      warehouse,
      categories,
      comment,
    },
  })

  if (inventory === null)
    throw new HttpError(400, 'Inventory not created', 'INVENTORY_NOT_CREATED')

  const mappedItems = products.map((product) => {
    const item = items.find(p => p.id === product.id)

    if (!item) {
      const productQuantity = product.warehouseStock.find(q => q.warehouse === warehouse)
      return {
        inventoryId,
        productId: product.id,
        quantity: productQuantity?.count ?? 0,
        receivedQuantity: 0,
      }
    }

    return {
      inventoryId,
      productId: item.id,
      quantity: item.quantity,
      receivedQuantity: item.receivedQuantity,
    }
  })

  for (const item of mappedItems) {
    await QuantityService.count({
      payload: {
        productId: item.productId,
        warehouse,
        count: item.receivedQuantity,
        mode: 'set',
        userId: createdBy,
        refType: 'inventory',
        refId: inventoryId,
      },
    })
  }

  await InventoryRepo.createItems({ payload: mappedItems })

  return {
    status: 'success',
    code: 'INVENTORY_CREATED',
    message: 'Inventory created',
    data: mapInventoryToDTO(inventory),
  }
}

export async function edit({ payload }: { payload: EditInventoriesPayload }): Promise<EditInventoryResponse> {
  const { id, warehouse, comment } = payload

  const inventory = await InventoryRepo.updateById({
    id,
    payload: {
      status: 'draft',
      warehouse,
      comment,
    },
  })

  if (inventory === null)
    throw new HttpError(400, 'Inventory not edited', 'INVENTORY_NOT_EDITED')

  return {
    status: 'success',
    code: 'INVENTORY_EDITED',
    message: 'Inventory edited',
    data: mapInventoryToDTO(inventory),
  }
}

export async function remove({ payload, user }: { payload: RemoveInventoriesPayload, user: AuthUser }): Promise<RemoveInventoriesResponse> {
  for (const id of payload.ids) {
    await InventoryRepo.removeById(id, user.id)
  }

  return {
    status: 'success',
    code: 'WAREHOUSE_TRANSACTION_REMOVED',
    message: 'Warehouse transaction removed',
  }
}
