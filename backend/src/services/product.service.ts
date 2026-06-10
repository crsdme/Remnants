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
  ProductDTO,
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
import { mapProductPopulatedToDTO, mapProductToDTO } from '@/mappers'
import * as CategoryRepository from '@/repositories/categories.repo'
import * as CurrencyRepository from '@/repositories/currencies.repo'
import * as LanguageRepository from '@/repositories/language.repo'
import * as ProductPropertyGroupRepository from '@/repositories/product-property-group.repo'
import * as ProductPropertyOptionRepository from '@/repositories/product-property-option.repo'
import * as ProductPropertyRepository from '@/repositories/product-property.repo'
import * as ProductRepository from '@/repositories/products.repo'
import * as SiteRepository from '@/repositories/site.repo'
import * as UnitRepository from '@/repositories/unit.repo'
import * as AuditLogsService from '@/services/audit-logs.service'
import * as BarcodeService from '@/services/barcode.service'
import * as SyncEntryService from '@/services/sync-entry.service'
import * as UserService from '@/services/user.service'
import {
  parseGetCategories,
  parseGetCurrency,
  parseGetLanguages,
  parseGetProductProperties,
  parseGetProductPropertyGroups,
  parseGetProductPropertyOptions,
  parseGetProductsRepo,
  parseGetSites,
  parseGetUnits,
} from '@/types/'
import { HttpError } from '@/utils'
import {
  extractLangMap,
  parseFile,
  parseId,
  parseMultiSelect,
  parseProductProperties,
  toBoolean,
  toNumber,
} from '@/utils/parseTools'

export async function get({ payload, user }: { payload: GetProductsPayload, user?: AuthUser }): Promise<GetProductsResponse> {
  const hasPurchasePricePermission = await UserService.checkPermission('product.purchasePrice', user?.id)
  const { items, total, page, pageSize } = await ProductRepository.list({ ...payload, hasPurchasePricePermission })

  return {
    status: 'success',
    code: 'PRODUCTS_FETCHED',
    message: 'Products fetched',
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

export async function create({ payload, uploadedImages }: { payload: CreateProductsPayload, uploadedImages: Express.Multer.File[] }): Promise<CreateProductResponse> {
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

  const createdProduct = await ProductRepository.createOne({
    names,
    price,
    purchasePrice,
    currency,
    categories,
    purchaseCurrency,
    productPropertiesGroup,
    productProperties: parsedProductProperties,
    unit,
    images: parsedUploadedImages,
  })

  let syncSitesId = syncSites

  if (isAutoSyncEnabled) {
    const { items } = await SiteRepository.list(parseGetSites({ pagination: { full: true } }))
    syncSitesId = items.map(site => site.id)
  }

  for (const site of syncSitesId) {
    await SyncEntryService.syncProductCreate({
      siteId: site,
      productId: createdProduct._id.toString(),
    })
  }

  if (generateBarcode) {
    await BarcodeService.create({
      payload: {
        products: [{ id: createdProduct._id.toString(), lineQuantity: 1 }],
        active: true,
      },
    })
  }

  // AuditLogsService.create({
  //   resourceType: 'product',
  //   resourceId: product._id.toString(),
  //   action: 'create',
  //   changes: diffToChangesFromDeep(
  //     normalizeProduct(null),
  //     normalizeProduct({
  //       names,
  //       price,
  //       purchasePrice,
  //       currency,
  //       categories,
  //       purchaseCurrency,
  //       productPropertiesGroup,
  //       productProperties: parsedProductProperties,
  //       unit,
  //       images: parsedUploadedImages,
  //     }),
  //   ),
  // })

  return {
    status: 'success',
    code: 'PRODUCT_CREATED',
    message: 'Product created',
    data: mapProductToDTO(createdProduct),
  }
}

export async function edit({ payload, uploadedImages }: { payload: EditProductsPayload, uploadedImages: Express.Multer.File[] }): Promise<EditProductResponse> {
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

  // const oldProduct = await ProductRepository.findById(id)

  const parsedProductProperties = productProperties.map(property => ({
    _id: property.id,
    value: property.value,
  }))

  let parsedUploadedImagesIds: string[] = []

  if (typeof uploadedImagesIds === 'string') {
    parsedUploadedImagesIds = [uploadedImagesIds]
  }

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
      name: Buffer.from(image.originalname, 'latin1').toString('utf8').slice(0, 40),
      type: image.mimetype,
    })
  }).filter(item => item !== undefined)

  const newProduct = {
    names,
    price,
    purchasePrice,
    currency,
    categories,
    purchaseCurrency,
    productPropertiesGroup,
    productProperties: parsedProductProperties,
    unit,
    images: parsedImages,
  }

  const updatedProduct = await ProductRepository.updateById(id, newProduct)

  if (!updatedProduct)
    throw new HttpError(400, 'Product not edited', 'PRODUCT_NOT_EDITED')

  let syncSitesId = syncSites

  if (isAutoSyncEnabled) {
    const { items } = await SiteRepository.list(parseGetSites({ pagination: { current: 1, pageSize: 1000 } }))
    syncSitesId = items.map(site => site.id)
  }

  for (const site of syncSitesId) {
    // const difference = getDifferenceDeep(normalizeProduct(oldProduct?.toObject()), normalizeProduct(newProduct))
    const difference = {}
    await SyncEntryService.syncProductEdit({
      siteId: site,
      productId: updatedProduct._id.toString(),
      difference,
    })
  }

  // AuditLogsService.create({
  //   resourceType: 'product',
  //   resourceId: product._id.toString(),
  //   action: 'edit',
  //   changes: diffToChangesFromDeep(
  //     normalizeProduct(oldProduct?.toObject()),
  //     normalizeProduct(newProduct),
  //   ),
  // })

  if (updatedProduct === null)
    throw new HttpError(400, 'Product not edited', 'PRODUCT_NOT_EDITED')

  return {
    status: 'success',
    code: 'PRODUCT_EDITED',
    message: 'Product edited',
    data: mapProductToDTO(updatedProduct),
  }
}

export async function remove({ payload }: { payload: RemoveProductsPayload }): Promise<RemoveProductResponse> {
  const { ids } = payload

  for (const id of ids) {
    const product = await ProductRepository.findById(id)

    if (!product)
      throw new HttpError(400, 'Product not removed', 'PRODUCT_NOT_REMOVED')

    // AuditLogsService.create({
    //   resourceType: 'product',
    //   resourceId: id.toString(),
    //   action: 'remove',
    //   changes: diffToChangesFromDeep(
    //     normalizeProduct(product?.toObject()),
    //     normalizeProduct(null),
    //   ),
    // })
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
    price: toNumber(row, 'price'),
    currency: parseId(row, 'currency'),
    purchasePrice: toNumber(row, 'purchasePrice'),
    purchaseCurrency: parseId(row, 'purchaseCurrency'),
    barcodes: parseMultiSelect(row, 'barcodes', 'values'),
    categories: parseMultiSelect(row, 'categories', 'id'),
    unit: parseId(row, 'unit'),
    productPropertiesGroup: parseId(row, 'productPropertiesGroup'),
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
  const productsForCreate = parsedProducts.filter(product => !product._id)

  if (productsForEdit.length > 0) {
    const bulkProducts = productsForEdit.map(product => ({
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            names: product.names as LanguageString,
            price: product.price,
            currency: product.currency,
            purchasePrice: product.purchasePrice,
            purchaseCurrency: product.purchaseCurrency,
            barcodes: product.barcodes,
            categories: product.categories,
            unit: product.unit,
            productPropertiesGroup: product.productPropertiesGroup,
            productProperties: product.productProperties,
          },
        },
      },
    }))

    await ProductRepository.bulkWrite(bulkProducts)
  }

  if (productsForCreate.length > 0) {
    for (const product of productsForCreate) {
      const createdProduct = await ProductRepository.createOne({
        ...product,
        productProperties: product.productProperties.map(property => ({
          _id: property._id,
          value: property.value,
        })),
      })

      for (const barcode of product.barcodes) {
        await BarcodeService.create({
          payload: {
            code: barcode,
            products: [{ id: createdProduct._id.toString(), lineQuantity: 1 }],
            active: true,
          },
        })
      }
    }
  }

  return {
    status: 'success',
    code: 'PRODUCTS_IMPORTED',
    message: 'Products imported',
  }
}

function addHiddenListWithValidation(params: {
  language?: string
  sheet: ExcelJS.Worksheet
  hiddenSheet: ExcelJS.Worksheet
  columnLetter: string
  columnKey: string
  items: unknown[]
  getLabel?: () => string
  getId?: () => string
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

  const values = items.map((item: unknown) => `${getLabel(item as Record<string, unknown>)} (${getId(item as Record<string, unknown>)})`)
  setHiddenColumnValues({ hiddenSheet, columnLetter, values })

  const formulaRange = `hidden!$${columnLetter}$1:$${columnLetter}$${values.length}`
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

  for (let r = 2; r <= sheet.rowCount; r++) {
    sheet.getCell(r, colIndex).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [formulaRange],
    }
  }
}

function getExcelColumnLetter(colIndex: number): string {
  let letter = ''
  while (colIndex > 0) {
    letter = String.fromCharCode(65 + (colIndex - 1) % 26) + letter
    colIndex = Math.floor((colIndex - 1) / 26)
  }
  return letter
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
    productProperties,
    selectedProducts,
  ] = await Promise.all([
    LanguageRepository.list(parseGetLanguages({ filters: { active: [true] }, pagination: { full: true } })),
    CurrencyRepository.list(parseGetCurrency({ filters: { active: [true] }, pagination: { full: true } })),
    UnitRepository.list(parseGetUnits({ filters: { active: [true] }, pagination: { full: true } })),
    CategoryRepository.list(parseGetCategories({ filters: { active: [true] }, pagination: { full: true } })),
    ProductPropertyGroupRepository.list(parseGetProductPropertyGroups({ filters: { active: [true] }, pagination: { full: true } })),
    ProductPropertyRepository.list(parseGetProductProperties({ filters: { active: [true] }, pagination: { full: true } })),
    ProductRepository.list({
      filters: { ids, language },
      pagination: { current: 1, pageSize: 1000, full: true },
      sorters: { seq: 'asc' },
      hasPurchasePricePermission,
    }),
  ])

  const workbook = new ExcelJS.Workbook()
  const hiddenSheet = workbook.addWorksheet('hidden')
  hiddenSheet.state = 'veryHidden'

  const groupedProducts: Record<string, ProductPopulatedDTO[]> = {}
  for (const product of selectedProducts.items) {
    const groupId = product.productPropertiesGroup.id.toString()

    if (groupedProducts[groupId] === undefined) {
      groupedProducts[groupId] = []
    }
    groupedProducts[groupId].push(product)
  }

  for (const [groupId, products] of Object.entries(groupedProducts)) {
    if (products.length === 0)
      continue

    const groupName = products[0].productPropertiesGroup?.names?.[language] as string ?? groupId
    const sheet = workbook.addWorksheet(groupName)

    const productPropertiesIds = productPropertiesGroups.items.find(item => item.id === groupId)?.productProperties || []
    const productPropertiesData = productProperties.items.filter(item => productPropertiesIds.includes(item.id))

    const dynamicKeys: { key: string, header: string, id: string, type: string }[] = []
    const dynamicColumns: { key: string, header: string }[] = []
    productPropertiesData.forEach(({ type, id, names }: { type: string, id: string, names: LanguageString }) => {
      if (type === 'multiSelect') {
        for (let i = 1; i <= 5; i++) {
          const key = `${id}_${i}`
          dynamicColumns.push({
            header: `${names[language] || 'NO_NAME'}_${i} (${key})`,
            key,
          })
          dynamicKeys.push({
            key,
            id,
            header: `${names[language] || 'NO_NAME'}_${i} (${key})`,
            type,
          })
        }
      }
      else {
        dynamicColumns.push({
          header: `${names[language] || 'NO_NAME'} (${id})`,
          key: id,
        })
        dynamicKeys.push({
          key: id,
          header: `${names[language] || 'NO_NAME'} (${id})`,
          id,
          type,
        })
      }
    })

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

    products.forEach((product: ProductPopulatedDTO) => {
      const row: Record<string, any> = {}

      row.id = product.id
      row.seq = product.seq
      row.images = product.images.map(image => `${STORAGE_URLS.productImages}/${image.filename}`).join(', ')

      for (const lang of languages.items) {
        row[`name_${lang.code}`] = product.names?.[lang.code] as string ?? ''
      }

      row.price = product.price
      row.purchasePrice = hasPurchasePricePermission ? product.purchasePrice : ''

      row.currency = `${product.currency?.names?.[language] ?? 'NO_NAME'} (${product.currency?.id ?? ''})`
      row.purchaseCurrency = hasPurchasePricePermission
        ? `${product.purchaseCurrency?.names?.[language] ?? 'NO_NAME'} (${product.purchaseCurrency?.id ?? ''})`
        : ''

      row.unit = `${product.unit?.names?.[language] ?? 'NO_NAME'} (${product.unit?.id ?? ''})`
      row.productPropertiesGroup = `${product.productPropertiesGroup?.names?.[language] ?? 'NO_NAME'} (${product.productPropertiesGroup?.id ?? ''})`

      for (let i = 1; i <= 5; i++) {
        row[`barcodes_${i}`] = product?.barcodes[i - 1] !== undefined ? `${product?.barcodes[i - 1]?.code}` : ''
        row[`categories_${i}`] = product?.categories[i - 1] !== undefined ? `${product?.categories[i - 1]?.names?.[language] as string ?? 'NO_NAME'} (${product?.categories[i - 1]?.id})` : ''
      }

      dynamicKeys.forEach(({ id, type, key }) => {
        const property = product.productProperties.find(item => item.id === id)
        if (type === 'multiSelect') {
          const options = property?.options || []
          const index = Number.parseInt(key.split('_')[1], 10) - 1
          const option = options[index]
          row[key] = option != null ? `${option.names?.[language]} (${option.id})` : ''
        }
        else if (type === 'select' || type === 'color') {
          row[key] = property?.options?.[0]
            ? `${property?.options[0].names?.[language]} (${property?.options[0].id})`
            : ''
        }
        else {
          row[key] = property?.value != null ? property.value : ''
        }
      })
      sheet.addRow(row)
    })

    addHiddenListWithValidation({ sheet, hiddenSheet, columnLetter: 'A', columnKey: 'currency', items: currencies.items })
    addHiddenListWithValidation({ sheet, hiddenSheet, columnLetter: 'A', columnKey: 'purchaseCurrency', items: currencies.items })
    addHiddenListWithValidation({ sheet, hiddenSheet, columnLetter: 'B', columnKey: 'unit', items: units.items })
    addHiddenListWithValidation({ sheet, hiddenSheet, columnLetter: 'C', columnKey: 'productPropertiesGroup', items: productPropertiesGroups.items })
    addHiddenListWithValidation({ sheet, hiddenSheet, columnLetter: 'D', columnKey: 'categories_1', items: categories.items })
    addHiddenListWithValidation({ sheet, hiddenSheet, columnLetter: 'D', columnKey: 'categories_2', items: categories.items })
    addHiddenListWithValidation({ sheet, hiddenSheet, columnLetter: 'D', columnKey: 'categories_3', items: categories.items })
    addHiddenListWithValidation({ sheet, hiddenSheet, columnLetter: 'D', columnKey: 'categories_4', items: categories.items })
    addHiddenListWithValidation({ sheet, hiddenSheet, columnLetter: 'D', columnKey: 'categories_5', items: categories.items })

    const propertiesLetters: Record<string, string> = {}
    for (const [index, property] of dynamicKeys.entries()) {
      if (['select', 'multiSelect', 'color'].includes(property.type)) {
        const productPropertiesOptions = await ProductPropertyOptionRepository.list(parseGetProductPropertyOptions(
          { filters: { productProperty: property.id }, pagination: { full: true } },
        ))

        if (!propertiesLetters[property.id])
          propertiesLetters[property.id] = getExcelColumnLetter(5 + index)

        addHiddenListWithValidation({
          sheet,
          items: productPropertiesOptions.items,
          hiddenSheet,
          columnKey: property.key,
          columnLetter: propertiesLetters[property.id],
        })
      }
    }
  }

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
  const { items } = await ProductRepository.list(parseGetProductsRepo({ pagination: { current: 1, pageSize: 1 } }))
  const exportHandlerResponse = await exportHandler({ payload: { ids: items.map(product => product.id) }, user })

  return {
    status: 'success',
    code: 'PRODUCTS_DOWNLOADED',
    message: 'Products downloaded',
    buffer: Buffer.from(exportHandlerResponse.buffer),
  }
}

// export async function downloadTemplate(user?: User): Promise<DownloadTemplateResponse> {
//   const language = 'en'

//   const languages = await LanguageModel.find({ active: true, removed: false })
//   const currencies = await CurrencyModel.find({ active: true, removed: false })
//   const units = await UnitModel.find({ active: true, removed: false })
//   const categories = await CategoryModel.find({ active: true, removed: false })
//   const productPropertiesGroups = await ProductPropertyGroupModel.find({ active: true, removed: false })
//   const productProperties = await ProductPropertyModel.find({ active: true, removed: false })

//   const hasPurchasePricePermission = await UserService.checkUserPermissions('product.purchasePrice', user)

//   const workbook = new ExcelJS.Workbook()
//   const hiddenSheet = workbook.addWorksheet('hidden')
//   hiddenSheet.state = 'veryHidden'

//   const { data: { items: selectedProducts } } = await get({ pagination: { current: 1, pageSize: 1 }, sorters: {} }, user)

//   const groupedProducts: Record<string, any[]> = {}
//   for (const product of selectedProducts) {
//     const groupId = product.productPropertiesGroup.id.toString()
//     if (!groupedProducts[groupId]) {
//       groupedProducts[groupId] = []
//     }
//     groupedProducts[groupId].push(product)
//   }

//   for (const [groupId, products] of Object.entries(groupedProducts)) {
//     const groupName = products[0].productPropertiesGroup.names[language] || groupId
//     const sheet = workbook.addWorksheet(groupName)

//     const productPropertiesIds = productPropertiesGroups.find(item => item.id === groupId)?.productProperties || []
//     const productPropertiesData = productProperties.filter(item => productPropertiesIds.includes(item.id))

//     const dynamicKeys: { key: string, header: string, id: string, type: string }[] = []
//     const dynamicColumns: { key: string, header: string }[] = []
//     productPropertiesData.forEach(({ type, id, names }: any) => {
//       if (type === 'multiSelect') {
//         for (let i = 1; i <= 5; i++) {
//           const key = `${id}_${i}`
//           dynamicColumns.push({
//             header: `${names.get(language) || 'NO_NAME'}_${i} (${key})`,
//             key,
//           })
//           dynamicKeys.push({
//             key,
//             id,
//             header: `${names.get(language) || 'NO_NAME'}_${i} (${key})`,
//             type,
//           })
//         }
//       }
//       else {
//         dynamicColumns.push({
//           header: `${names.get(language) || 'NO_NAME'} (${id})`,
//           key: id,
//         })
//         dynamicKeys.push({
//           key: id,
//           header: `${names.get(language) || 'NO_NAME'} (${id})`,
//           id,
//           type,
//         })
//       }
//     })

//     sheet.columns = [
//       { header: 'id', key: 'id' },
//       { header: 'seq', key: 'seq' },
//       { header: 'images', key: 'images' },
//       ...languages.map(lang => ({
//         header: `name_${lang.code}`,
//         key: `name_${lang.code}`,
//       })),
//       { header: 'price', key: 'price' },
//       { header: 'purchasePrice', key: 'purchasePrice' },
//       { header: 'currency', key: 'currency' },
//       { header: 'purchaseCurrency', key: 'purchaseCurrency' },
//       { header: 'unit', key: 'unit' },
//       { header: 'productPropertiesGroup', key: 'productPropertiesGroup' },
//       { header: 'categories_1', key: 'categories_1' },
//       { header: 'categories_2', key: 'categories_2' },
//       { header: 'categories_3', key: 'categories_3' },
//       { header: 'categories_4', key: 'categories_4' },
//       { header: 'categories_5', key: 'categories_5' },
//       { header: 'barcodes_1', key: 'barcodes_1' },
//       { header: 'barcodes_2', key: 'barcodes_2' },
//       { header: 'barcodes_3', key: 'barcodes_3' },
//       { header: 'barcodes_4', key: 'barcodes_4' },
//       { header: 'barcodes_5', key: 'barcodes_5' },
//       { header: 'generateBarcode', key: 'generateBarcode' },
//       ...dynamicColumns,
//     ]

//     products.forEach((product: any) => {
//       const row: Record<string, any> = {}

//       row.id = product.id
//       row.seq = product.seq
//       row.generateBarcode = 'NO'
//       row.images = product.images.map((image: any) => `${STORAGE_URLS.productImages}/${image.filename}`).join(', ')
//       for (const lang of languages) {
//         row[`name_${lang.code}`] = product.names[lang.code] || ''
//       }
//       row.price = product.price
//       row.purchasePrice = product.purchasePrice
//       row.currency = `${product.currency.names[language] || 'NO_NAME'} (${product.currency.id})`
//       if (hasPurchasePricePermission) {
//         row.purchaseCurrency = `${product.purchaseCurrency.names[language] || 'NO_NAME'} (${product.purchaseCurrency.id})`
//       }
//       else {
//         row.purchaseCurrency = ''
//       }
//       row.unit = `${product.unit.names[language] || 'NO_NAME'} (${product.unit.id})`
//       row.productPropertiesGroup = `${product.productPropertiesGroup.names[language] || 'NO_NAME'} (${product.productPropertiesGroup.id})`
//       for (let i = 1; i <= 5; i++) {
//         row[`categories_${i}`] = product?.categories[i - 1] ? `${product?.categories[i - 1]?.names[language] || 'NO_NAME'} (${product?.categories[i - 1]?.id})` : ''
//         row[`barcodes_${i}`] = product?.barcodes[i - 1] ? `${product?.barcodes[i - 1]?.code}` : ''
//       }
//       dynamicKeys.forEach(({ id, type, key }) => {
//         const property = product.productProperties.find(
//           (item: any) => (item.id || item._id)?.toString() === id.toString(),
//         )
//         if (type === 'multiSelect') {
//           const options = property?.optionData || []
//           const index = Number.parseInt(key.split('_')[1], 10) - 1
//           const option = options[index]
//           row[key] = option ? `${option.names?.[language]} (${option.id})` : ''
//         }
//         else if (type === 'select' || type === 'color') {
//           row[key] = property?.optionData?.[0]
//             ? `${property?.optionData[0].names?.[language]} (${property?.optionData[0].id})`
//             : ''
//         }
//         else {
//           row[key] = property?.value || ''
//         }
//       })
//       sheet.addRow(row)
//     })

//     createHiddenList({ data: currencies, columnKey: 'A', columnName: 'currency' })
//     createHiddenList({ data: currencies, columnKey: 'A', columnName: 'purchaseCurrency' })
//     createHiddenList({ data: units, columnKey: 'B', columnName: 'unit' })
//     createHiddenList({ data: productPropertiesGroups, columnKey: 'C', columnName: 'productPropertiesGroup' })
//     createHiddenList({ data: categories, columnKey: 'D', columnName: 'categories_1' })
//     createHiddenList({ data: categories, columnKey: 'D', columnName: 'categories_2' })
//     createHiddenList({ data: categories, columnKey: 'D', columnName: 'categories_3' })
//     createHiddenList({ data: categories, columnKey: 'D', columnName: 'categories_4' })
//     createHiddenList({ data: categories, columnKey: 'D', columnName: 'categories_5' })
//     createHiddenListTrueFalse({ columnKey: 'E', columnName: 'generateBarcode' })
//     const propertiesLetters: Record<string, string> = {}
//     for (const [index, property] of dynamicKeys.entries()) {
//       if (['select', 'multiSelect', 'color'].includes(property.type)) {
//         const { data: { items: productPropertiesOptions } } = await ProductPropertyOptionService.get({
//           filters: { productProperty: property.id },
//           pagination: { full: true },
//         })
//         if (!propertiesLetters[property.id])
//           propertiesLetters[property.id] = getExcelColumnLetter(5 + index)

//         createHiddenList({
//           data: productPropertiesOptions,
//           columnKey: propertiesLetters[property.id],
//           columnName: property.key,
//         })
//       }
//     }

//     function createHiddenList({ data, columnKey, columnName }: { data: any[], columnKey: string, columnName: string }) {
//       const options = data.map((item: any) => {
//         const name = item.names.get(language) || 'NO_NAME'
//         return `${name} (${item._id})`
//       })

//       options.forEach((value, index) => {
//         hiddenSheet.getCell(`${columnKey}${index + 1}`).value = value
//       })

//       const formulaRange = `hidden!$${columnKey}$1:$${columnKey}$${options.length}`
//       const column = sheet.columns.findIndex(col => col.key === columnName) + 1

//       for (let i = 2; i <= sheet.rowCount; i++) {
//         sheet.getCell(i, column).dataValidation = {
//           type: 'list',
//           allowBlank: true,
//           formulae: [formulaRange],
//         }
//       }
//     }

//     function createHiddenListTrueFalse({ columnKey, columnName }: { columnKey: string, columnName: string }) {
//       const data = [{ id: 'YES' }, { id: 'NO' }]
//       const options = data.map((item: any) => item.id)

//       options.forEach((value, index) => {
//         hiddenSheet.getCell(`${columnKey}${index + 1}`).value = value
//       })

//       const formulaRange = `hidden!$${columnKey}$1:$${columnKey}$${options.length}`
//       const column = sheet.columns.findIndex(col => col.key === columnName) + 1

//       for (let i = 2; i <= sheet.rowCount; i++) {
//         sheet.getCell(i, column).dataValidation = {
//           type: 'list',
//           allowBlank: true,
//           formulae: [formulaRange],
//         }
//       }
//     }

//     function getExcelColumnLetter(colIndex: number): string {
//       let letter = ''
//       while (colIndex > 0) {
//         letter = String.fromCharCode(65 + (colIndex - 1) % 26) + letter
//         colIndex = Math.floor((colIndex - 1) / 26)
//       }
//       return letter
//     }
//   }

//   await workbook.xlsx.writeFile(path.join(STORAGE_PATHS.exportProducts, `${uuidv4()}.xlsx`))

//   const buffer = await workbook.xlsx.writeBuffer()

//   return {
//     status: 'success',
//     code: 'PRODUCTS_TEMPLATE_DOWNLOADED',
//     message: 'Products template downloaded',
//     buffer: Buffer.from(buffer),
//   }
// }

// function normalizeProduct(product: any) {
//   if (!product)
//     return null

//   // оставляем только нужные для синка поля
//   const {
//     names,
//     price,
//     purchasePrice,
//     currency,
//     categories,
//     purchaseCurrency,
//     productPropertiesGroup,
//     productProperties,
//     unit,
//     images,
//   } = product

//   return {
//     names: names instanceof Map ? Object.fromEntries(names) : names,
//     price,
//     purchasePrice,
//     currency,
//     categories: Array.isArray(categories) ? [...categories].sort() : [],
//     purchaseCurrency,
//     productPropertiesGroup,
//     productProperties: Array.isArray(productProperties)
//       ? productProperties
//         .map((p: any) => ({ _id: p._id, value: p.value }))
//         .sort((a, b) => a._id.localeCompare(b._id))
//       : [],
//     unit,
//     images: Array.isArray(images)
//       ? images.map((img: any) => ({
//         id: img.id,
//         path: img.path,
//         filename: img.filename,
//         name: img.name,
//         type: img.type,
//       }))
//       : [],
//   }
// }
