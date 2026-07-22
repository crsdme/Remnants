import type {
  AuthUser,
  CreateInventoryResponse,
  EditInventoryResponse,
  GetInventoriesResponse,
  GetInventoryItemsResponse,
  RemoveInventoriesResponse,
  ScanBarcodeToDraftInventoryResponse,
} from '@remnant/shared'
import type {
  CreateInventoriesPayload,
  EditInventoriesPayload,
  GetInventoriesPayload,
  GetInventoryItemsPayload,
  RemoveInventoriesPayload,
  ScanBarcodeToDraftsPayload,
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

export async function scanBarcodeToDraft({ payload }: { payload: ScanBarcodeToDraftsPayload }): Promise<ScanBarcodeToDraftInventoryResponse> {
  const { barcode, category } = payload.filters

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
      categoriesIds: categories,
      createdBy,
      status: 'confirmed',
      comment,
    },
  })

  if (inventory === null)
    throw new HttpError(400, 'Inventory not created', 'INVENTORY_NOT_CREATED')

  const mappedItems = products.map((product) => {
    const item = items.find(p => p.id === product.id)
    const bookQuantity = product.warehouseStock.find(q => q.warehouse === warehouse)?.count ?? 0

    if (!item) {
      return {
        inventoryId,
        productId: product.id,
        quantity: bookQuantity,
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
  const { id, warehouse, categories, comment } = payload

  const inventory = await InventoryRepo.updateById({
    id,
    payload: {
      status: 'draft',
      warehouse,
      categoriesIds: categories,
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
    const inventory = await InventoryRepo.findById(id)

    if (inventory === null || inventory.removed)
      throw new HttpError(404, 'Inventory not found', 'INVENTORY_NOT_FOUND')

    if (inventory.status === 'cancelled')
      throw new HttpError(400, 'Inventory already cancelled', 'INVENTORY_ALREADY_CANCELLED')

    const inventoryItems = await InventoryRepo.findItemsByInventoryId(id)

    for (const item of inventoryItems) {
      await QuantityService.count({
        payload: {
          productId: item.productId,
          warehouse: inventory.warehouse,
          count: item.quantity,
          mode: 'set',
          userId: user.id,
          refType: 'inventory',
          refId: id,
        },
      })
    }

    const cancelled = await InventoryRepo.cancelById(id, user.id)

    if (cancelled === null)
      throw new HttpError(400, 'Inventory already cancelled', 'INVENTORY_ALREADY_CANCELLED')
  }

  return {
    status: 'success',
    code: 'INVENTORIES_REMOVED',
    message: 'Inventories removed',
  }
}
