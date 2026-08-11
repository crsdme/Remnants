import type {
  AuthUser,
  ConfirmInventoryResponse,
  CreateInventoryResponse,
  EditInventoryResponse,
  GetInventoriesResponse,
  GetInventoryItemsResponse,
  RemoveInventoriesResponse,
  ScanBarcodeToDraftInventoryResponse,
  UpsertInventoryItemResponse,
} from '@remnant/shared'
import type {
  ConfirmInventoryPayload,
  CreateInventoriesPayload,
  EditInventoriesPayload,
  ExportInventoryPayload,
  GetInventoriesPayload,
  GetInventoryItemsPayload,
  GetInventoryProgressPayload,
  RemoveInventoriesPayload,
  ScanBarcodeToDraftsPayload,
  UpsertInventoryItemPayload,
} from '@/types/'
import ExcelJS from 'exceljs'
import { v4 as uuidv4 } from 'uuid'
import { mapInventoryToDTO } from '@/mappers'
import * as InventoryRepo from '@/repositories/inventory.repo'
import * as BarcodeService from '@/services/barcode.service'
import * as ProductService from '@/services/product.service'
import * as QuantityService from '@/services/quantity.service'
import {
  parseGetBarcodes,
  parseGetInventoryItems,
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

export async function getProgress({ payload }: { payload: GetInventoryProgressPayload }) {
  const progress = await InventoryRepo.getProgress(payload.filters.inventoryId)

  return {
    status: 'success' as const,
    code: 'INVENTORY_PROGRESS_FETCHED',
    message: 'Inventory progress fetched',
    data: progress,
  }
}

export async function scanBarcodeToDraft({ payload }: { payload: ScanBarcodeToDraftsPayload }): Promise<ScanBarcodeToDraftInventoryResponse> {
  const { barcode, inventoryId, category } = payload.filters

  const inventory = await InventoryRepo.findById(inventoryId)
  if (inventory === null || inventory.removed)
    throw new HttpError(404, 'Inventory not found', 'INVENTORY_NOT_FOUND')

  if (inventory.status !== 'draft')
    throw new HttpError(400, 'Inventory is not editable', 'INVENTORY_NOT_DRAFT')

  const { data: { items: barcodes } } = await BarcodeService.get({
    payload: parseGetBarcodes({ filters: { codes: [barcode] }, pagination: { full: true } }),
  })

  if (barcodes.length === 0 || barcodes[0].products.length === 0)
    throw new HttpError(404, 'Product not found', 'PRODUCT_NOT_FOUND')

  let product: ScanBarcodeToDraftInventoryResponse['product'] | null = null
  let inventoryItem: Awaited<ReturnType<typeof InventoryRepo.findItemByInventoryAndProduct>> = null
  let unitsPerScan = 1

  for (const barcodeProduct of barcodes[0].products) {
    const scopedItem = await InventoryRepo.findItemByInventoryAndProduct(inventoryId, barcodeProduct.id)
    if (scopedItem === null)
      continue

    const { unitsPerScan: barcodeUnitsPerScan, ...productWithoutUnits } = barcodeProduct
    product = productWithoutUnits
    inventoryItem = scopedItem
    unitsPerScan = barcodeUnitsPerScan ?? 1
    break
  }

  if (product === null || inventoryItem === null)
    throw new HttpError(400, 'Product is not in inventory scope', 'INVENTORY_PRODUCT_NOT_IN_SCOPE')

  let productIndex: number | undefined
  if (category != null && category !== '') {
    const indexResult = await ProductService.getIndex({
      payload: parseGetProductsIndex({ productId: product.id, filters: { categories: [category] } }),
    })
    productIndex = indexResult.productIndex
  }

  return {
    status: 'success',
    code: 'INVENTORY_ITEMS_FETCHED',
    message: 'Inventory items fetched',
    product,
    productIndex,
    inventoryId,
    unitsPerScan,
    item: {
      id: String(inventoryItem._id),
      inventoryId: inventoryItem.inventoryId,
      productId: inventoryItem.productId,
      quantity: inventoryItem.quantity,
      receivedQuantity: inventoryItem.receivedQuantity,
      counted: inventoryItem.counted,
    },
  }
}

export async function create({ payload, user }: { payload: CreateInventoriesPayload, user: AuthUser }): Promise<CreateInventoryResponse> {
  const { warehouseId, categories, comment, items = [] } = payload
  const createdBy = user.id
  const inventoryId = uuidv4()

  const { data: { items: products } } = await ProductService.get({
    payload: parseGetProducts({ filters: { categories }, pagination: { full: true } }),
  })

  if (products.length === 0)
    throw new HttpError(400, 'No products in selected categories', 'INVENTORY_NO_PRODUCTS')

  const [inventory] = await InventoryRepo.create({
    payload: {
      _id: inventoryId,
      warehouseId,
      categoryIds: categories,
      createdBy,
      status: 'draft',
      comment,
    },
  })

  if (inventory === null)
    throw new HttpError(400, 'Inventory not created', 'INVENTORY_NOT_CREATED')

  const mappedItems = products.map((product) => {
    const item = items.find(p => p.id === product.id)
    const bookQuantity = product.warehouseStock.find(q => q.warehouseId === warehouseId)?.count ?? 0
    const hasCountedValue = item != null && item.receivedQuantity !== undefined && item.receivedQuantity !== null

    return {
      _id: uuidv4(),
      inventoryId,
      productId: product.id,
      quantity: bookQuantity,
      receivedQuantity: hasCountedValue ? Number(item.receivedQuantity) : null,
      counted: hasCountedValue,
    }
  })

  await InventoryRepo.createItems({ payload: mappedItems })

  return {
    status: 'success',
    code: 'INVENTORY_CREATED',
    message: 'Inventory draft created',
    data: mapInventoryToDTO(inventory),
  }
}

export async function upsertItem({ payload }: { payload: UpsertInventoryItemPayload }): Promise<UpsertInventoryItemResponse> {
  const inventory = await InventoryRepo.findById(payload.inventoryId)

  if (inventory === null || inventory.removed)
    throw new HttpError(404, 'Inventory not found', 'INVENTORY_NOT_FOUND')

  if (inventory.status !== 'draft')
    throw new HttpError(400, 'Inventory is not editable', 'INVENTORY_NOT_DRAFT')

  const existing = await InventoryRepo.findItemByInventoryAndProduct(payload.inventoryId, payload.productId)
  const item = await InventoryRepo.upsertItemByProduct({
    inventoryId: payload.inventoryId,
    productId: payload.productId,
    payload: {
      quantity: existing?.quantity,
      receivedQuantity: payload.receivedQuantity,
      counted: true,
    },
  })

  const progress = await InventoryRepo.getProgress(payload.inventoryId)

  return {
    status: 'success',
    code: 'INVENTORY_ITEM_UPSERTED',
    message: 'Inventory item saved',
    data: {
      id: String(item._id),
      inventoryId: item.inventoryId,
      productId: item.productId,
      quantity: item.quantity,
      receivedQuantity: item.receivedQuantity,
      counted: item.counted,
    },
    progress,
  }
}

export async function confirm({ payload, user }: { payload: ConfirmInventoryPayload, user: AuthUser }): Promise<ConfirmInventoryResponse> {
  const inventory = await InventoryRepo.findById(payload.id)

  if (inventory === null || inventory.removed)
    throw new HttpError(404, 'Inventory not found', 'INVENTORY_NOT_FOUND')

  if (inventory.status !== 'draft')
    throw new HttpError(400, 'Inventory is not a draft', 'INVENTORY_NOT_DRAFT')

  const inventoryItems = await InventoryRepo.findItemsByInventoryId(payload.id)

  for (const item of inventoryItems) {
    const shouldApply = payload.mode === 'close_zone' || item.counted
    if (!shouldApply)
      continue

    const count = item.counted ? (item.receivedQuantity ?? 0) : 0

    if (payload.mode === 'close_zone' && !item.counted) {
      await InventoryRepo.updateOneItem({
        payload: {
          id: item._id,
          receivedQuantity: 0,
          counted: true,
        },
      })
    }

    await QuantityService.count({
      payload: {
        productId: item.productId,
        warehouseId: inventory.warehouseId,
        count,
        mode: 'set',
        userId: user.id,
        refType: 'inventory',
        refId: payload.id,
      },
    })
  }

  const updated = await InventoryRepo.updateById({
    id: payload.id,
    payload: { status: 'confirmed' },
  })

  if (!updated)
    throw new HttpError(400, 'Inventory not confirmed', 'INVENTORY_NOT_CONFIRMED')

  return {
    status: 'success',
    code: 'INVENTORY_CONFIRMED',
    message: 'Inventory confirmed',
    data: mapInventoryToDTO(updated),
  }
}

export async function edit({ payload }: { payload: EditInventoriesPayload }): Promise<EditInventoryResponse> {
  const inventory = await InventoryRepo.findById(payload.id)

  if (inventory === null || inventory.removed)
    throw new HttpError(404, 'Inventory not found', 'INVENTORY_NOT_FOUND')

  if (inventory.status !== 'draft')
    throw new HttpError(400, 'Inventory is not editable', 'INVENTORY_NOT_DRAFT')

  const updated = await InventoryRepo.updateById({
    id: payload.id,
    payload: {
      ...(payload.warehouseId !== undefined ? { warehouseId: payload.warehouseId } : {}),
      ...(payload.categories !== undefined ? { categoryIds: payload.categories } : {}),
      ...(payload.comment !== undefined ? { comment: payload.comment } : {}),
    },
  })

  if (updated === null)
    throw new HttpError(400, 'Inventory not edited', 'INVENTORY_NOT_EDITED')

  return {
    status: 'success',
    code: 'INVENTORY_EDITED',
    message: 'Inventory edited',
    data: mapInventoryToDTO(updated),
  }
}

export async function remove({ payload, user }: { payload: RemoveInventoriesPayload, user: AuthUser }): Promise<RemoveInventoriesResponse> {
  for (const id of payload.ids) {
    const inventory = await InventoryRepo.findById(id)

    if (inventory === null || inventory.removed)
      throw new HttpError(404, 'Inventory not found', 'INVENTORY_NOT_FOUND')

    if (inventory.status !== 'draft')
      throw new HttpError(400, 'Only draft inventories can be removed', 'INVENTORY_NOT_DRAFT')

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

export async function exportExcel({ payload }: { payload: ExportInventoryPayload }) {
  const inventory = await InventoryRepo.findById(payload.id)

  if (inventory === null || inventory.removed)
    throw new HttpError(404, 'Inventory not found', 'INVENTORY_NOT_FOUND')

  const language = (payload.language || 'ru') as 'ru' | 'en'
  const pickName = (names?: { ru?: string, en?: string } | null) =>
    names?.[language] ?? names?.ru ?? names?.en ?? ''

  const { items: inventories } = await InventoryRepo.list({
    payload: {
      filters: { seq: String(inventory.seq) },
      sorters: {},
      pagination: { current: 1, pageSize: 1, full: false },
    },
  })
  const inventoryDto = inventories[0] ?? mapInventoryToDTO(inventory)

  const { items } = await InventoryRepo.listItems({
    payload: parseGetInventoryItems({
      filters: {
        inventoryId: payload.id,
        view: payload.view,
      },
      pagination: { full: true },
    }),
  })

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Remnant'
  workbook.created = new Date()

  const summary = workbook.addWorksheet('Summary')
  summary.columns = [
    { header: 'Field', key: 'field', width: 24 },
    { header: 'Value', key: 'value', width: 48 },
  ]
  summary.addRows([
    { field: 'seq', value: inventoryDto.seq },
    { field: 'status', value: inventoryDto.status },
    { field: 'warehouse', value: pickName(inventoryDto.warehouse.names) || inventoryDto.warehouse.id },
    { field: 'categories', value: inventoryDto.categories.map(category => pickName(category.names) || category.id).join(', ') },
    { field: 'comment', value: inventoryDto.comment ?? '' },
    { field: 'createdAt', value: new Date(inventoryDto.createdAt).toISOString() },
    { field: 'updatedAt', value: new Date(inventoryDto.updatedAt).toISOString() },
    { field: 'items', value: items.length },
  ])

  const sheet = workbook.addWorksheet('Items')
  sheet.columns = [
    { header: 'seq', key: 'seq', width: 10 },
    { header: 'name', key: 'name', width: 36 },
    { header: 'barcodes', key: 'barcodes', width: 28 },
    { header: 'stockStatus', key: 'stockStatus', width: 18 },
    { header: 'book', key: 'book', width: 12 },
    { header: 'counted', key: 'counted', width: 12 },
    { header: 'diff', key: 'diff', width: 12 },
    { header: 'unit', key: 'unit', width: 10 },
    { header: 'lineStatus', key: 'lineStatus', width: 14 },
  ]

  for (const item of items) {
    const book = item.quantity
    const counted = item.counted ? (item.receivedQuantity ?? 0) : null
    const hasMismatch = item.counted && counted !== book
    const lineStatus = !item.counted
      ? 'uncounted'
      : hasMismatch
        ? 'mismatch'
        : 'match'

    sheet.addRow({
      seq: item.product?.seq ?? '',
      name: pickName(item.product?.names) || item.productId,
      barcodes: item.product?.barcodes?.map(barcode => barcode.code).join(', ') ?? '',
      stockStatus: pickName(item.product?.stockStatus?.names),
      book,
      counted: counted ?? '',
      diff: counted == null ? '' : counted - book,
      unit: pickName(item.product?.unit?.symbols),
      lineStatus,
    })
  }

  const buffer = await workbook.xlsx.writeBuffer()

  return {
    status: 'success' as const,
    code: 'INVENTORY_EXPORTED',
    message: 'Inventory exported',
    buffer: Buffer.from(buffer),
    filename: `inventory-${inventoryDto.seq}.xlsx`,
  }
}
