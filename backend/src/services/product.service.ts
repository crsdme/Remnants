import type {
  AuthUser,
  BatchProductResponse,
  CreateProductResponse,
  DownloadTemplateResponse,
  EditProductResponse,
  ExportProductsResponse,
  GetProductIndexResponse,
  GetProductsResponse,
  ImportProductsResponse,
  LanguageString,
  ProductPopulatedDTO,
  RemoveProductResponse,
} from '@remnant/shared'
import type {
  BatchProductsPayload,
  CreateProductsPayload,
  EditProductsPayload,
  ExportProductsPayload,
  GetProductsIndexPayload,
  GetProductsPayload,
  RemoveProductsPayload,
} from '@/types/'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import ExcelJS from 'exceljs'
import { v4 as uuidv4 } from 'uuid'
import { STORAGE_PATHS, STORAGE_URLS } from '@/config/constants'
import { mapProductPopulatedRepoToDTO } from '@/mappers'
import * as CategoryRepository from '@/repositories/categories.repo'
import * as CurrencyRepository from '@/repositories/currencies.repo'
import * as LanguageRepository from '@/repositories/language.repo'
import * as ProductPropertyGroupRepository from '@/repositories/product-property-group.repo'
import * as ProductPropertyOptionRepository from '@/repositories/product-property-option.repo'
import * as ProductRepository from '@/repositories/products.repo'
import * as SiteRepository from '@/repositories/site.repo'
import * as UnitRepository from '@/repositories/unit.repo'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import * as AuditLogsService from '@/services/audit-logs.service'
import * as BarcodeService from '@/services/barcode.service'
import * as ProductStockStatusService from '@/services/product-stock-status.service'
import * as SyncEntryService from '@/services/sync-entry.service'
import * as UserService from '@/services/user.service'
import {
  parseGetCategories,
  parseGetCurrency,
  parseGetLanguages,
  parseGetProductPropertyGroups,
  parseGetProductPropertyOptions,
  parseGetUnits,
} from '@/types/'
import { buildAuditChanges, getDifferenceDeep, getEntityIdsWithCapabilityForUser, HttpError, toAuditSnapshot, withTransaction } from '@/utils'
import logger from '@/utils/logger'
import { toMinor } from '@/utils/money'
import {
  extractLangMap,
  parseFile,
  parseId,
  parseMultiSelect,
  parseProductProperties,
  toBoolean,
  toNumber,
} from '@/utils/parseTools'

const PRODUCT_AUDIT_OMIT = ['barcodeIds', 'quantityIds', 'stockStatusId', 'lastSaleAt'] as const

export async function get({ payload, user }: { payload: GetProductsPayload, user?: AuthUser }): Promise<GetProductsResponse> {
  const hasPurchasePricePermission = await UserService.checkPermission('product.purchasePrice', user?.id)
  const { items, total, page, pageSize } = await ProductRepository.list({ ...payload, hasPurchasePricePermission })

  // Products themselves are never scoped by warehouse access.
  // Only stock counts are masked when the user lacks viewStock on a warehouse.
  let viewStockWarehouseIds: string[] | null = null
  if (user && !user.permissions.includes('other.admin')) {
    const access = await UserAccessRepo.getScopesByUserId(user.id)
    viewStockWarehouseIds = getEntityIdsWithCapabilityForUser(access, 'warehouses', 'viewStock', user)
  }

  const statuses = await ProductStockStatusService.listActiveStatuses()

  const mappedItems = await Promise.all(items.map(async (item) => {
    const warehouseStock = await ProductStockStatusService.decorateWarehouseStock(item.warehouseStock ?? [], statuses)
    const dto = mapProductPopulatedRepoToDTO({ ...item, warehouseStock })
    if (viewStockWarehouseIds == null)
      return dto

    const allowed = new Set(viewStockWarehouseIds)
    return {
      ...dto,
      warehouseStock: dto.warehouseStock.map(stock => (
        allowed.has(stock.warehouseId)
          ? stock
          : { ...stock, count: 0, stockStatus: null }
      )),
    }
  }))

  return {
    status: 'success',
    code: 'PRODUCTS_FETCHED',
    message: 'Products fetched',
    data: {
      items: mappedItems,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function getIndex({ payload }: { payload: GetProductsIndexPayload }): Promise<GetProductIndexResponse> {
  const productIndex = await ProductRepository.findIndex(payload)

  if (productIndex === null)
    throw new HttpError(400, 'Product index not found', 'PRODUCT_INDEX_NOT_FOUND')

  return {
    status: 'success',
    code: 'PRODUCT_INDEX_FETCHED',
    message: 'Product index fetched',
    productIndex,
  }
}

export async function create({ payload, uploadedImages, user }: { payload: CreateProductsPayload, uploadedImages: Express.Multer.File[], user?: AuthUser }): Promise<CreateProductResponse> {
  const {
    names,
    price,
    purchasePrice,
    currency,
    categories,
    purchaseCurrency,
    productPropertiesGroup,
    productProperties,
    unit,
    generateBarcode,
    isAutoSyncEnabled,
    syncSites,
  } = payload

  const parsedProductProperties = productProperties.map(property => ({
    _id: property.id,
    value: property.value,
  }))

  const parsedUploadedImages = uploadedImages.map(image => ({
    filename: image.filename,
    name: Buffer.from(image.originalname, 'latin1').toString('utf8').slice(0, 40),
    type: image.mimetype,
    path: image.path,
  }))

  const [currencyDoc, purchaseCurrencyDoc] = await Promise.all([
    CurrencyRepository.findOne({ _id: currency }),
    CurrencyRepository.findOne({ _id: purchaseCurrency }),
  ])

  if (currencyDoc === null)
    throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

  if (purchaseCurrencyDoc === null)
    throw new HttpError(400, 'Purchase currency not found', 'PURCHASE_CURRENCY_NOT_FOUND')

  const createdProduct = await ProductRepository.createOne({
    names,
    minorPrice: toMinor(price, currencyDoc.scale),
    minorPurchasePrice: toMinor(purchasePrice, purchaseCurrencyDoc.scale),
    currencyId: currency,
    categoryIds: categories,
    purchaseCurrencyId: purchaseCurrency,
    productPropertiesGroupId: productPropertiesGroup,
    productProperties: parsedProductProperties,
    unitId: unit,
    images: parsedUploadedImages.map(image => ({
      path: image.path,
      filename: image.filename,
      name: image.name,
      type: image.type,
    })),
  })

  const syncSiteIds = await resolveSyncSiteIds(isAutoSyncEnabled, syncSites)
  await pushProductToSites('create', createdProduct._id.toString(), syncSiteIds)

  if (generateBarcode) {
    await BarcodeService.create({
      payload: {
        products: [{ id: createdProduct._id.toString(), unitsPerScan: 1 }],
        active: true,
      },
    })
  }

  const changes = buildAuditChanges(null, createdProduct, { omit: PRODUCT_AUDIT_OMIT })
  if (changes.length > 0) {
    await AuditLogsService.create({
      resourceType: 'product',
      resourceId: createdProduct._id.toString(),
      action: 'create',
      changes,
      createdBy: user?.id,
    })
  }

  return {
    status: 'success',
    code: 'PRODUCT_CREATED',
    message: 'Product created',
  }
}

export async function edit({ payload, uploadedImages, user }: { payload: EditProductsPayload, uploadedImages: Express.Multer.File[], user?: AuthUser }): Promise<EditProductResponse> {
  const {
    names,
    price,
    purchasePrice,
    currency,
    categories,
    purchaseCurrency,
    productPropertiesGroup,
    productProperties,
    unit,
    images,
    id,
    uploadedImagesIds,
    isAutoSyncEnabled,
    syncSites,
  } = payload

  const oldProduct = await ProductRepository.findById(id)

  if (!oldProduct)
    throw new HttpError(404, 'Product not found', 'PRODUCT_NOT_FOUND')

  const parsedProductProperties = productProperties.map(property => ({
    _id: property.id,
    value: property.value,
  }))

  const parsedUploadedImagesIds = uploadedImagesIds ?? []

  const parsedUploadedImages = parsedUploadedImagesIds.map((image, index) => {
    if (uploadedImages[index] !== undefined) {
      return ({
        id: image,
        path: uploadedImages[index].path,
        filename: uploadedImages[index].filename,
        name: Buffer.from(uploadedImages[index].originalname, 'latin1').toString('utf8').slice(0, 40),
        type: uploadedImages[index].mimetype,
      })
    }
    return undefined
  }).filter(item => item !== undefined)

  const parsedImages = images.map((image) => {
    if (image.isNew) {
      const newImage = parsedUploadedImages.find(uploadedImage => uploadedImage?.id === image.id)

      if (newImage) {
        return ({
          path: newImage.path,
          filename: newImage.filename,
          name: newImage.name,
          type: newImage.type,
        })
      }
      return undefined
    }
    const pathName = new URL(image.path).pathname
    return ({
      path: path.join(path.resolve(), pathName),
      filename: image.filename,
      name: image.name,
      type: image.type,
    })
  }).filter(item => item !== undefined)

  const [currencyDoc, purchaseCurrencyDoc] = await Promise.all([
    CurrencyRepository.findOne({ _id: currency }),
    CurrencyRepository.findOne({ _id: purchaseCurrency }),
  ])

  if (currencyDoc === null)
    throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

  if (purchaseCurrencyDoc === null)
    throw new HttpError(400, 'Purchase currency not found', 'PURCHASE_CURRENCY_NOT_FOUND')

  const newProduct = {
    names,
    minorPrice: toMinor(price, currencyDoc.scale),
    minorPurchasePrice: toMinor(purchasePrice, purchaseCurrencyDoc.scale),
    currencyId: currency,
    categoryIds: categories,
    purchaseCurrencyId: purchaseCurrency,
    productPropertiesGroupId: productPropertiesGroup,
    productProperties: parsedProductProperties,
    unitId: unit,
    images: parsedImages.map(image => ({
      path: image.path,
      filename: image.filename,
      name: image.name,
      type: image.type,
    })),
  }

  const updatedProduct = await ProductRepository.updateById(id, newProduct)

  if (!updatedProduct)
    throw new HttpError(400, 'Product not edited', 'PRODUCT_NOT_EDITED')

  const differenceRaw = getDifferenceDeep(
    toAuditSnapshot(oldProduct, { omit: PRODUCT_AUDIT_OMIT }),
    toAuditSnapshot(newProduct, { omit: PRODUCT_AUDIT_OMIT }),
  )
  const difference = Array.isArray(differenceRaw) ? {} : differenceRaw

  const syncSiteIds = await resolveSyncSiteIds(isAutoSyncEnabled, syncSites)
  await pushProductToSites('edit', updatedProduct._id.toString(), syncSiteIds, difference)

  const changes = buildAuditChanges(oldProduct, newProduct, { omit: PRODUCT_AUDIT_OMIT })
  if (changes.length > 0) {
    await AuditLogsService.create({
      resourceType: 'product',
      resourceId: updatedProduct._id.toString(),
      action: 'edit',
      changes,
      createdBy: user?.id,
    })
  }

  return {
    status: 'success',
    code: 'PRODUCT_EDITED',
    message: 'Product edited',
  }
}

export async function remove({ payload, user }: { payload: RemoveProductsPayload, user?: AuthUser }): Promise<RemoveProductResponse> {
  const { ids } = payload

  for (const id of ids) {
    const product = await ProductRepository.findById(id)

    if (!product)
      throw new HttpError(400, 'Product not removed', 'PRODUCT_NOT_REMOVED')

    const removed = await ProductRepository.removeById(id)

    if (!removed)
      throw new HttpError(400, 'Product not removed', 'PRODUCT_NOT_REMOVED')

    await AuditLogsService.create({
      resourceType: 'product',
      resourceId: id.toString(),
      action: 'remove',
      changes: buildAuditChanges(product, null, { omit: PRODUCT_AUDIT_OMIT }),
      createdBy: user?.id,
    })
  }

  return {
    status: 'success',
    code: 'PRODUCTS_REMOVED',
    message: 'Products removed',
  }
}

export async function batch({ payload }: { payload: BatchProductsPayload }): Promise<BatchProductResponse> {
  console.log(payload)
  // const { ids, filters, params } = payload

  // const {
  //   names,
  //   language,
  //   price,
  //   purchasePrice,
  //   categories,
  //   unit,
  //   productPropertiesGroup,
  //   productProperties,
  //   createdAt,
  //   updatedAt,
  // } = filters

  // const allowedParams = ['names', 'price', 'purchasePrice', 'barcodes', 'categories', 'unit', 'currency', 'purchaseCurrency', 'productPropertiesGroup', 'productProperties']

  // const batchParams = params
  //   .filter(item => item.column && item.value && allowedParams.includes(item.column))
  //   .map(item => ({ [`${item.column}`]: item.value }))

  // const mergedBatchParams = Object.assign({}, ...batchParams)

  // const query = buildQuery({
  //   filters: { names, price, purchasePrice, barcodes, categories, unit, productPropertiesGroup, productProperties, createdAt, updatedAt },
  //   rules: {
  //     names: { type: 'string', langAware: true },
  //     price: { type: 'exact' },
  //     purchasePrice: { type: 'exact' },
  //     barcodes: { type: 'array' },
  //     categories: { type: 'array' },
  //     unit: { type: 'array' },
  //     productPropertiesGroup: { type: 'exact' },
  //     productProperties: { type: 'array' },
  //     createdAt: { type: 'dateRange' },
  //     updatedAt: { type: 'dateRange' },
  //   },
  //   language,
  //   batch: { ids: ids && ids.map(id => id.toString()) },
  // })

  // const products = await ProductModel.updateMany(
  //   query,
  //   { $set: mergedBatchParams },
  // )

  return {
    status: 'success',
    code: 'PRODUCTS_BATCH_EDITED',
    message: 'Products batch edited',
  }
}

export async function importHandler({ file }: { file: Express.Multer.File }): Promise<ImportProductsResponse> {
  const storedFile = await parseFile(file.path)

  const parsedProducts = storedFile.map(row => ({
    _id: parseId(row, 'id'),
    names: extractLangMap(row, 'name'),
    minorPrice: toMinor(toNumber(row, 'price'), 2),
    currencyId: parseId(row, 'currency'),
    minorPurchasePrice: toMinor(toNumber(row, 'purchasePrice'), 2),
    purchaseCurrencyId: parseId(row, 'purchaseCurrency'),
    barcodes: parseMultiSelect(row, 'barcodes', 'values'),
    categoryIds: parseMultiSelect(row, 'categories', 'id'),
    unitId: parseId(row, 'unit'),
    productPropertiesGroupId: parseId(row, 'productPropertiesGroup'),
    productProperties: parseProductProperties(row)
      .map(property => ({
        _id: property._id,
        value: property.value,
      })),
    images: [],
    uploadedImages: [],
    generateBarcode: toBoolean(row, 'generateBarcode'),
  }))

  const productsForEdit = parsedProducts.filter(product => product._id !== undefined)
  const productsForCreate = parsedProducts.filter(product => product._id === undefined)

  await withTransaction(async (session) => {
    if (productsForEdit.length > 0) {
      const bulkProducts = productsForEdit.map(product => ({
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              names: product.names as LanguageString,
              minorPrice: product.minorPrice,
              currencyId: product.currencyId,
              minorPurchasePrice: product.minorPurchasePrice,
              purchaseCurrencyId: product.purchaseCurrencyId,
              barcodes: product.barcodes,
              categoryIds: product.categoryIds,
              unitId: product.unitId,
              productPropertiesGroupId: product.productPropertiesGroupId,
              productProperties: product.productProperties,
            },
          },
        },
      }))

      await ProductRepository.bulkWrite(bulkProducts, session)
    }

    for (const product of productsForCreate) {
      const {
        currencyId,
        purchaseCurrencyId,
        unitId,
        productPropertiesGroupId,
        generateBarcode,
        barcodes,
      } = product

      if (currencyId === undefined || purchaseCurrencyId === undefined || unitId === undefined || productPropertiesGroupId === undefined) {
        throw new HttpError(
          400,
          'Product import row is missing required currency, purchase currency, unit or property group',
          'PRODUCT_IMPORT_INVALID_ROW',
        )
      }

      if (product.categoryIds.length === 0) {
        throw new HttpError(
          400,
          'Product import row must include at least one category',
          'PRODUCT_IMPORT_INVALID_ROW',
        )
      }

      const createdProduct = await ProductRepository.createOne({
        names: product.names as LanguageString,
        minorPrice: product.minorPrice,
        currencyId,
        minorPurchasePrice: product.minorPurchasePrice,
        purchaseCurrencyId,
        categoryIds: product.categoryIds,
        unitId,
        productPropertiesGroupId,
        productProperties: product.productProperties.map(property => ({
          _id: property._id,
          value: property.value,
        })),
        images: product.images,
      }, session)

      for (const barcode of barcodes) {
        await BarcodeService.create({
          payload: {
            code: barcode,
            products: [{ id: createdProduct._id.toString(), unitsPerScan: 1 }],
            active: true,
          },
          session,
        })
      }

      if (generateBarcode) {
        await BarcodeService.create({
          payload: {
            products: [{ id: createdProduct._id.toString(), unitsPerScan: 1 }],
            active: true,
          },
          session,
        })
      }
    }
  })

  return {
    status: 'success',
    code: 'PRODUCTS_IMPORTED',
    message: 'Products imported',
  }
}

const HIDDEN_SHEET_NAME = 'hidden'
const VALIDATION_ROW_END = 1000

function formatRef(label: string, id: string): string {
  return `${label} (${id})`
}

function createHiddenColumnAllocator() {
  let next = 1
  return () => getExcelColumnLetter(next++)
}

function addHiddenListWithValidation(params: {
  language?: string
  sheet: ExcelJS.Worksheet
  hiddenSheet: ExcelJS.Worksheet
  columnLetter: string
  columnKey: string
  items: unknown[]
  getLabel?: (item: Record<string, unknown>) => string
  getId?: (item: Record<string, unknown>) => string
}) {
  const {
    language = 'en',
    sheet,
    hiddenSheet,
    columnLetter,
    columnKey,
    items,
    getLabel = (item: Record<string, unknown>) => (item.names as LanguageString)?.[language] ?? 'NO_NAME',
    getId = (item: Record<string, unknown>) => item._id?.toString() ?? item.id?.toString() ?? 'UNKNOWN_ID',
  } = params

  const values = items.map((item: unknown) => {
    const record = item as Record<string, unknown>
    return formatRef(getLabel(record), getId(record))
  })
  setHiddenColumnValues({ hiddenSheet, columnLetter, values })

  const formulaRange = `${HIDDEN_SHEET_NAME}!$${columnLetter}$1:$${columnLetter}$${Math.max(values.length, 1)}`
  applyListValidation({ sheet, columnKey, formulaRange })
}

function setHiddenColumnValues(params: {
  hiddenSheet: ExcelJS.Worksheet
  columnLetter: string
  values: string[]
}) {
  const { hiddenSheet, columnLetter, values } = params
  for (const [i, v] of values.entries()) {
    hiddenSheet.getCell(`${columnLetter}${i + 1}`).value = v
  }
}

function applyListValidation(params: {
  sheet: ExcelJS.Worksheet
  columnKey: string
  formulaRange: string
}) {
  const { sheet, columnKey, formulaRange } = params
  const colIndex = sheet.columns.findIndex(c => c.key === columnKey) + 1
  if (colIndex <= 0)
    return

  const rowEnd = Math.max(sheet.rowCount, VALIDATION_ROW_END)
  for (let r = 2; r <= rowEnd; r++) {
    sheet.getCell(r, colIndex).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [formulaRange],
    }
  }
}

function getExcelColumnLetter(colIndex: number): string {
  let letter = ''
  let n = colIndex
  while (n > 0) {
    letter = String.fromCharCode(65 + (n - 1) % 26) + letter
    n = Math.floor((n - 1) / 26)
  }
  return letter
}

function safeSheetName(name: string, fallback: string): string {
  const cleaned = name.replace(/[\\/*?:[\]]/g, '_').trim()
  const base = (cleaned || fallback).slice(0, 31)
  return base.length > 0 ? base : fallback.slice(0, 31)
}

type DynamicKey = { key: string, header: string, id: string, type: string }

function buildDynamicColumns(
  productPropertiesData: Array<{ type: string, id: string, names: LanguageString }>,
  language: 'ru' | 'en' | 'ua',
): { dynamicKeys: DynamicKey[], dynamicColumns: { key: string, header: string }[] } {
  const dynamicKeys: DynamicKey[] = []
  const dynamicColumns: { key: string, header: string }[] = []
  for (const { type, id, names } of productPropertiesData) {
    if (type === 'multiSelect') {
      for (let i = 1; i <= 5; i++) {
        const key = `${id}_${i}`
        const header = `${names[language] || 'NO_NAME'}_${i} (${key})`
        dynamicColumns.push({ header, key })
        dynamicKeys.push({ key, id, header, type })
      }
    }
    else {
      const header = `${names[language] || 'NO_NAME'} (${id})`
      dynamicColumns.push({ header, key: id })
      dynamicKeys.push({ key: id, header, id, type })
    }
  }
  return { dynamicKeys, dynamicColumns }
}

async function applySheetValidations(params: {
  sheet: ExcelJS.Worksheet
  hiddenSheet: ExcelJS.Worksheet
  nextHiddenCol: () => string
  language: string
  currencies: unknown[]
  units: unknown[]
  productPropertiesGroups: unknown[]
  categories: unknown[]
  dynamicKeys: DynamicKey[]
}) {
  const {
    sheet,
    hiddenSheet,
    nextHiddenCol,
    language,
    currencies,
    units,
    productPropertiesGroups,
    categories,
    dynamicKeys,
  } = params

  addHiddenListWithValidation({ sheet, hiddenSheet, language, columnLetter: nextHiddenCol(), columnKey: 'currency', items: currencies })
  addHiddenListWithValidation({ sheet, hiddenSheet, language, columnLetter: nextHiddenCol(), columnKey: 'purchaseCurrency', items: currencies })
  addHiddenListWithValidation({ sheet, hiddenSheet, language, columnLetter: nextHiddenCol(), columnKey: 'unit', items: units })
  addHiddenListWithValidation({ sheet, hiddenSheet, language, columnLetter: nextHiddenCol(), columnKey: 'productPropertiesGroup', items: productPropertiesGroups })
  for (let i = 1; i <= 5; i++) {
    addHiddenListWithValidation({ sheet, hiddenSheet, language, columnLetter: nextHiddenCol(), columnKey: `categories_${i}`, items: categories })
  }

  const propertiesLetters: Record<string, string> = {}
  for (const property of dynamicKeys) {
    if (!['select', 'multiSelect', 'color'].includes(property.type))
      continue

    const productPropertiesOptions = await ProductPropertyOptionRepository.list(parseGetProductPropertyOptions(
      { filters: { productPropertyId: property.id }, pagination: { full: true } },
    ))

    if (!propertiesLetters[property.id])
      propertiesLetters[property.id] = nextHiddenCol()

    addHiddenListWithValidation({
      sheet,
      language,
      items: productPropertiesOptions.items,
      hiddenSheet,
      columnKey: property.key,
      columnLetter: propertiesLetters[property.id],
    })
  }
}

async function buildProductWorkbook(params: {
  language: 'ru' | 'en' | 'ua'
  hasPurchasePricePermission: boolean
  languages: { items: Array<{ code: string }> }
  currencies: { items: unknown[] }
  units: { items: unknown[] }
  categories: { items: unknown[] }
  productPropertiesGroups: { items: Array<{ id: string, names: LanguageString, productProperties: Array<{ type: string, id: string, names: LanguageString }> }> }
  groups: Array<{
    groupId: string
    groupName: string
    products: ProductPopulatedDTO[]
  }>
}): Promise<ExcelJS.Workbook> {
  const {
    language,
    hasPurchasePricePermission,
    languages,
    currencies,
    units,
    categories,
    productPropertiesGroups,
    groups,
  } = params

  const workbook = new ExcelJS.Workbook()
  const nextHiddenCol = createHiddenColumnAllocator()
  const usedSheetNames = new Set<string>()
  const sheetsToValidate: Array<{ sheet: ExcelJS.Worksheet, dynamicKeys: DynamicKey[] }> = []

  const sheetGroups = groups.length > 0
    ? groups
    : [{ groupId: 'default', groupName: 'Products', products: [] as ProductPopulatedDTO[] }]

  for (const { groupId, groupName, products } of sheetGroups) {
    let sheetName = safeSheetName(groupName, groupId)
    if (usedSheetNames.has(sheetName)) {
      const suffix = `_${groupId.slice(0, 8)}`
      sheetName = safeSheetName(`${groupName.slice(0, Math.max(0, 31 - suffix.length))}${suffix}`, groupId)
    }
    usedSheetNames.add(sheetName)

    const sheet = workbook.addWorksheet(sheetName)
    const productPropertiesData = productPropertiesGroups.items.find(item => item.id === groupId)?.productProperties ?? []
    const { dynamicKeys, dynamicColumns } = buildDynamicColumns(productPropertiesData, language)

    sheet.columns = [
      { header: 'id', key: 'id' },
      { header: 'seq', key: 'seq' },
      { header: 'images', key: 'images' },
      ...languages.items.map(lang => ({
        header: `name_${lang.code}`,
        key: `name_${lang.code}`,
      })),
      { header: 'price', key: 'price' },
      { header: 'purchasePrice', key: 'purchasePrice' },
      { header: 'currency', key: 'currency' },
      { header: 'purchaseCurrency', key: 'purchaseCurrency' },
      { header: 'unit', key: 'unit' },
      { header: 'productPropertiesGroup', key: 'productPropertiesGroup' },
      ...Array.from({ length: 5 }, (_, i) => ({ header: `categories_${i + 1}`, key: `categories_${i + 1}` })),
      ...Array.from({ length: 5 }, (_, i) => ({ header: `barcodes_${i + 1}`, key: `barcodes_${i + 1}` })),
      ...dynamicColumns,
    ]

    for (const product of products) {
      const row: Record<string, unknown> = {}

      row.id = product.id
      row.seq = product.seq
      row.images = product.images.map(image => `${STORAGE_URLS.productImages}/${image.filename}`).join(', ')

      for (const lang of languages.items) {
        row[`name_${lang.code}`] = product.names?.[lang.code as keyof typeof product.names] ?? ''
      }

      row.price = product.price
      row.purchasePrice = hasPurchasePricePermission ? product.purchasePrice : ''

      row.currency = formatRef(product.currency?.names?.[language] ?? 'NO_NAME', product.currency?.id ?? '')
      row.purchaseCurrency = hasPurchasePricePermission
        ? formatRef(product.purchaseCurrency?.names?.[language] ?? 'NO_NAME', product.purchaseCurrency?.id ?? '')
        : ''

      row.unit = formatRef(product.unit?.names?.[language] ?? 'NO_NAME', product.unit?.id ?? '')
      row.productPropertiesGroup = formatRef(
        product.productPropertiesGroup?.names?.[language] ?? 'NO_NAME',
        product.productPropertiesGroup?.id ?? '',
      )

      for (let i = 1; i <= 5; i++) {
        row[`barcodes_${i}`] = product?.barcodes[i - 1] !== undefined ? `${product?.barcodes[i - 1]?.code}` : ''
        row[`categories_${i}`] = product?.categories[i - 1] !== undefined
          ? formatRef(
              (product?.categories[i - 1]?.names?.[language] as string) ?? 'NO_NAME',
              product?.categories[i - 1]?.id ?? '',
            )
          : ''
      }

      for (const { id, type, key } of dynamicKeys) {
        const property = product.productProperties.find(item => item.id === id)
        if (type === 'multiSelect') {
          const options = property?.options || []
          const index = Number.parseInt(key.split('_')[1], 10) - 1
          const option = options[index]
          row[key] = option != null ? formatRef(option.names?.[language] ?? 'NO_NAME', option.id) : ''
        }
        else if (type === 'select' || type === 'color') {
          row[key] = property?.options?.[0]
            ? formatRef(property.options[0].names?.[language] ?? 'NO_NAME', property.options[0].id)
            : ''
        }
        else {
          row[key] = property?.value != null ? property.value : ''
        }
      }
      sheet.addRow(row)
    }

    sheetsToValidate.push({ sheet, dynamicKeys })
  }

  const hiddenSheet = workbook.addWorksheet(HIDDEN_SHEET_NAME)
  hiddenSheet.state = 'veryHidden'

  for (const { sheet, dynamicKeys } of sheetsToValidate) {
    await applySheetValidations({
      sheet,
      hiddenSheet,
      nextHiddenCol,
      language,
      currencies: currencies.items,
      units: units.items,
      productPropertiesGroups: productPropertiesGroups.items,
      categories: categories.items,
      dynamicKeys,
    })
  }

  return workbook
}

export async function exportHandler({ payload, user }: { payload: ExportProductsPayload, user: AuthUser }): Promise<ExportProductsResponse> {
  const { ids } = payload
  const language = 'ru' as const
  const hasPurchasePricePermission = await UserService.checkPermission('product.purchasePrice', user.id)

  const [
    languages,
    currencies,
    units,
    categories,
    productPropertiesGroups,
    selectedProducts,
  ] = await Promise.all([
    LanguageRepository.list(parseGetLanguages({ filters: { active: [true] }, pagination: { full: true } })),
    CurrencyRepository.list(parseGetCurrency({ filters: { active: [true] }, pagination: { full: true } })),
    UnitRepository.list(parseGetUnits({ filters: { active: [true] }, pagination: { full: true } })),
    CategoryRepository.list(parseGetCategories({ filters: { active: [true] }, pagination: { full: true } })),
    ProductPropertyGroupRepository.list(parseGetProductPropertyGroups({ filters: { active: [true] }, pagination: { full: true } })),
    ProductRepository.list({
      filters: { ids, language },
      pagination: { current: 1, pageSize: 1000, full: true },
      sorters: { seq: 'asc' },
      hasPurchasePricePermission,
    }),
  ])

  const groupedProducts: Record<string, ProductPopulatedDTO[]> = {}
  for (const product of selectedProducts.items.map(mapProductPopulatedRepoToDTO)) {
    const groupId = product.productPropertiesGroup.id.toString()
    if (groupedProducts[groupId] === undefined)
      groupedProducts[groupId] = []
    groupedProducts[groupId].push(product)
  }

  const groups = Object.entries(groupedProducts).map(([groupId, products]) => ({
    groupId,
    groupName: (products[0].productPropertiesGroup?.names?.[language] as string) ?? groupId,
    products,
  }))

  const workbook = await buildProductWorkbook({
    language,
    hasPurchasePricePermission,
    languages,
    currencies,
    units,
    categories,
    productPropertiesGroups,
    groups,
  })

  await workbook.xlsx.writeFile(path.join(STORAGE_PATHS.exportProducts, `${uuidv4()}.xlsx`))
  const buffer = await workbook.xlsx.writeBuffer()

  return {
    status: 'success',
    code: 'PRODUCTS_EXPORTED',
    message: 'Products exported',
    buffer: Buffer.from(buffer),
  }
}

export async function downloadTemplate({ user }: { user: AuthUser }): Promise<DownloadTemplateResponse> {
  const language = 'ru' as const
  const hasPurchasePricePermission = await UserService.checkPermission('product.purchasePrice', user.id)

  const [
    languages,
    currencies,
    units,
    categories,
    productPropertiesGroups,
  ] = await Promise.all([
    LanguageRepository.list(parseGetLanguages({ filters: { active: [true] }, pagination: { full: true } })),
    CurrencyRepository.list(parseGetCurrency({ filters: { active: [true] }, pagination: { full: true } })),
    UnitRepository.list(parseGetUnits({ filters: { active: [true] }, pagination: { full: true } })),
    CategoryRepository.list(parseGetCategories({ filters: { active: [true] }, pagination: { full: true } })),
    ProductPropertyGroupRepository.list(parseGetProductPropertyGroups({ filters: { active: [true] }, pagination: { full: true } })),
  ])

  const groups = productPropertiesGroups.items.map(group => ({
    groupId: group.id,
    groupName: (group.names?.[language] as string) ?? group.id,
    products: [] as ProductPopulatedDTO[],
  }))

  const workbook = await buildProductWorkbook({
    language,
    hasPurchasePricePermission,
    languages,
    currencies,
    units,
    categories,
    productPropertiesGroups,
    groups,
  })

  const buffer = await workbook.xlsx.writeBuffer()

  return {
    status: 'success',
    code: 'PRODUCTS_DOWNLOADED',
    message: 'Products downloaded',
    buffer: Buffer.from(buffer),
  }
}

async function resolveSyncSiteIds(
  isAutoSyncEnabled: boolean | undefined,
  syncSites: string[] | undefined,
): Promise<string[]> {
  if (isAutoSyncEnabled) {
    const sites = await SiteRepository.listActive()
    return sites.map(site => site._id)
  }

  const ids = [...new Set(syncSites ?? [])]
  if (ids.length === 0)
    return []

  const sites = await SiteRepository.listActiveByIds(ids)
  return sites.map(site => site._id)
}

async function pushProductToSites(
  kind: 'create' | 'edit',
  productId: string,
  siteIds: string[],
  difference: Record<string, unknown> = {},
) {
  for (const siteId of siteIds) {
    try {
      if (kind === 'create') {
        await SyncEntryService.syncProductCreate({ siteId, productId })
        continue
      }
      await SyncEntryService.syncProductEdit({ siteId, productId, difference })
    }
    catch (error) {
      logger.error(error)
    }
  }
}
