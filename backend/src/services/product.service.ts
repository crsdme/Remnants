import type { GetProductsPayload, UserDTO } from '@/types/'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import ExcelJS from 'exceljs'
import { v4 as uuidv4 } from 'uuid'
import { STORAGE_PATHS, STORAGE_URLS } from '@/config/constants'
import { CategoryModel, CurrencyModel, LanguageModel, ProductModel, ProductPropertyGroupModel, ProductPropertyModel, SiteModel, UnitModel } from '@/models/'
import * as ProductRepository from '@/repositories/products.repo'
import * as AuditLogsService from '@/services/audit-logs.service'
import * as BarcodeService from '@/services/barcode.service'
import * as ProductPropertyOptionService from '@/services/product-property-option.service'
import * as ProductService from '@/services/product.service'
import * as SyncEntryService from '@/services/sync-entry.service'
import * as UserService from '@/services/user.service'
import { HttpError } from '@/utils'
import { buildQuery, buildSortQuery, diffToChangesFromDeep, getDifferenceDeep } from '@/utils/'
import {
  extractLangMap,
  parseBarcodes,
  parseCategories,
  parseFile,
  parseGenerateBarcode,
  parseId,
  parseProductProperties,
  toNumber,
} from '@/utils/parseTools'

export async function get(payload: GetProductsPayload, user: UserDTO): Promise<GetProductsResponse> {
  const { items, total, page, pageSize } = await ProductRepository.list({ ...payload, user })

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

export async function getIndex(payload: GetProductsIndexParams): Promise<GetProductsIndexResponse> {
  const {
    productId,
    search = '',
    ids = [],
    seq = undefined,
    names = '',
    language = 'en',
    price = undefined,
    purchasePrice = undefined,
    barcodes = undefined,
    categories = undefined,
    unit = undefined,
    productPropertiesGroup = undefined,
    productProperties = undefined,
    createdAt = {
      from: undefined,
      to: undefined,
    },
    updatedAt = {
      from: undefined,
      to: undefined,
    },
  } = payload.filters || {}

  const sorters = buildSortQuery(payload.sorters || {}, { seq: 1 })

  const filterRules: any = {
    _id: { type: 'array' },
    seq: { type: 'exact' },
    names: { type: 'string', langAware: true },
    active: { type: 'array' },
    price: { type: 'exact' },
    purchasePrice: { type: 'exact' },
    barcodes: { type: 'array' },
    categories: { type: 'array' },
    unit: { type: 'exact' },
    productPropertiesGroup: { type: 'exact' },
    productProperties: { type: 'array' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  }

  const query = buildQuery({
    filters: { _id: ids, seq, names, price, purchasePrice, barcodes, categories, unit, productPropertiesGroup, productProperties, createdAt, updatedAt },
    rules: filterRules,
    language,
  })

  const filterRulesLast: any = {
    search: {
      type: 'multiFieldSearch',
      multiFields: [
        { field: `names`, langAware: true },
        { field: `categories.names`, langAware: true, isArray: true },
      ],
    },
  }

  const queryLast = buildQuery({
    filters: { barcodes, categories, unit, productPropertiesGroup, productProperties, search },
    rules: filterRulesLast,
    language,
    removed: false,
  })

  const pipeline = [
    {
      $match: query,
    },
    {
      $match: queryLast,
    },
    {
      $sort: sorters,
    },
  ]

  const productsRaw = await ProductModel.aggregate(pipeline).exec()

  const productIndex = productsRaw.findIndex(doc => String(doc._id) === String(productId))

  return {
    status: 'success',
    code: 'PRODUCTS_FETCHED',
    message: 'Products fetched',
    productIndex,
  }
}

export async function create(payload: CreateProductParams): Promise<CreateProductResponse> {
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
    uploadedImages,
    generateBarcode,
    isAutoSyncEnabled,
    syncSites,
  } = payload

  const parsedProductProperties = productProperties.map(property => ({
    _id: property.id,
    value: property.value,
  }))

  const parsedUploadedImages = uploadedImages.map((image: any) => ({
    filename: image.filename,
    name: Buffer.from(image.originalname, 'latin1').toString('utf8').slice(0, 40),
    type: image.mimetype,
    path: image.path,
  }))

  const product = await ProductModel.create({
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
    const autoSyncSites = await SiteModel.find({})
    syncSitesId = autoSyncSites.map(site => site.id)
  }

  for (const site of syncSitesId || []) {
    await SyncEntryService.syncProductCreate({
      siteId: site,
      productId: product._id.toString(),
    })
  }

  if (generateBarcode) {
    await BarcodeService.create({
      products: [{ id: product._id.toString(), quantity: 1 }],
      active: true,
    })
  }

  AuditLogsService.create({
    resourceType: 'product',
    resourceId: product._id.toString(),
    action: 'create',
    changes: diffToChangesFromDeep(
      normalizeProduct(null),
      normalizeProduct({
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
      }),
    ),
  })

  return {
    status: 'success',
    code: 'PRODUCT_CREATED',
    message: 'Product created',
    data: product,
  }
}

export async function edit(payload: EditProductParams): Promise<EditProductResponse> {
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
    uploadedImages,
    uploadedImagesIds,
    isAutoSyncEnabled,
    syncSites,
  } = payload

  const oldProduct = await ProductModel.findOne({ _id: id })

  const parsedProductProperties = productProperties.map(property => ({
    _id: property.id,
    value: property.value,
  }))

  let parsedUploadedImagesIds: string[] = []

  if (typeof uploadedImagesIds === 'string') {
    parsedUploadedImagesIds = [uploadedImagesIds]
  }

  const parsedUploadedImages = parsedUploadedImagesIds.map((image, index) => ({
    id: image,
    path: uploadedImages[index].path,
    filename: uploadedImages[index].filename,
    name: Buffer.from(uploadedImages[index].originalname, 'latin1').toString('utf8').slice(0, 40),
    type: uploadedImages[index].mimetype,
  }))

  const parsedImages = images.map((image: any) => {
    if (image.isNew) {
      const newImage = parsedUploadedImages.find((uploadedImage: any) => uploadedImage.id === image.id) as any

      return ({
        path: newImage.path,
        filename: newImage.filename,
        name: newImage.name,
        type: newImage.type,
      })
    }
    const pathName = new URL(image.path).pathname
    return ({
      path: path.join(path.resolve(), pathName),
      filename: image.filename,
      name: image.name,
      type: image.type,
    })
  })

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

  const product = await ProductModel.findOneAndUpdate({ _id: id }, newProduct)

  if (!product) {
    throw new HttpError(400, 'Product not edited', 'PRODUCT_NOT_EDITED')
  }

  let syncSitesId = syncSites

  if (isAutoSyncEnabled) {
    const autoSyncSites = await SiteModel.find({})
    syncSitesId = autoSyncSites.map(site => site.id)
  }

  for (const siteId of syncSitesId || []) {
    const difference = getDifferenceDeep(normalizeProduct(oldProduct?.toObject()), normalizeProduct(newProduct))
    await SyncEntryService.syncProductEdit({
      siteId,
      productId: product._id.toString(),
      difference,
    })
  }

  AuditLogsService.create({
    resourceType: 'product',
    resourceId: product._id.toString(),
    action: 'edit',
    changes: diffToChangesFromDeep(
      normalizeProduct(oldProduct?.toObject()),
      normalizeProduct(newProduct),
    ),
  })

  return {
    status: 'success',
    code: 'PRODUCT_EDITED',
    message: 'Product edited',
    data: product,
  }
}

export async function remove(payload: RemoveProductsParams): Promise<RemoveProductsResponse> {
  const { ids } = payload

  const products = await ProductModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!products) {
    throw new HttpError(400, 'Products not removed', 'PRODUCTS_NOT_REMOVED')
  }

  for (const id of ids) {
    const product = await ProductModel.findOne({ _id: id })

    AuditLogsService.create({
      resourceType: 'product',
      resourceId: id.toString(),
      action: 'remove',
      changes: diffToChangesFromDeep(
        normalizeProduct(product?.toObject()),
        normalizeProduct(null),
      ),
    })
  }

  return {
    status: 'success',
    code: 'PRODUCTS_REMOVED',
    message: 'Products removed',
  }
}

export async function batch(payload: BatchProductsParams): Promise<BatchProductsResponse> {
  const { ids, filters, params } = payload

  const {
    names = '',
    language = 'en',
    price = undefined,
    purchasePrice = undefined,
    barcodes = undefined,
    categories = undefined,
    unit = undefined,
    productPropertiesGroup = undefined,
    productProperties = undefined,
    createdAt = {
      from: undefined,
      to: undefined,
    },
    updatedAt = {
      from: undefined,
      to: undefined,
    },
  } = filters || {}

  const allowedParams = ['names', 'price', 'purchasePrice', 'barcodes', 'categories', 'unit', 'currency', 'purchaseCurrency', 'productPropertiesGroup', 'productProperties']

  const batchParams = params
    .filter(item => item.column && item.value && allowedParams.includes(item.column))
    .map(item => ({ [`${item.column}`]: item.value }))

  const mergedBatchParams = Object.assign({}, ...batchParams)

  const filterRules = {
    names: { type: 'string', langAware: true },
    price: { type: 'exact' },
    purchasePrice: { type: 'exact' },
    barcodes: { type: 'array' },
    categories: { type: 'array' },
    unit: { type: 'array' },
    productPropertiesGroup: { type: 'exact' },
    productProperties: { type: 'array' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { names, price, purchasePrice, barcodes, categories, unit, productPropertiesGroup, productProperties, createdAt, updatedAt },
    rules: filterRules,
    language,
    batch: { ids: ids && ids.map(id => id.toString()) },
  })

  const products = await ProductModel.updateMany(
    query,
    { $set: mergedBatchParams },
  )

  if (!products) {
    throw new HttpError(400, 'Products not batch edited', 'PRODUCTS_NOT_BATCH_EDITED')
  }

  return {
    status: 'success',
    code: 'PRODUCTS_BATCH_EDITED',
    message: 'Products batch edited',
  }
}

// export async function duplicate(payload: DuplicateProductParams): Promise<DuplicateProductResponse> {
//   const { ids } = payload

//   const products = await ProductModel.find({ _id: { $in: ids } })

//   const parsedProducts = products.map(product => ({
//     names: product.names,
//     price: product.price,
//     purchasePrice: product.purchasePrice,
//     barcodes: product.barcodes,
//     categories: product.categories,
//     unit: product.unit,
//     productPropertiesGroup: product.productPropertiesGroup,
//     productProperties: product.productProperties,
//   }))

//   await ProductModel.create(parsedProducts)

//   return {
//     status: 'success',
//     code: 'PRODUCTS_DUPLICATED',
//     message: 'Products duplicated',
//   }
// }

export async function importHandler(payload: ImportProductsParams): Promise<ImportProductsResponse> {
  const { file } = payload

  const storedFile = await parseFile(file.path)

  const parsedProducts = storedFile.map(row => ({
    _id: row.id || undefined,
    names: extractLangMap(row, 'name'),
    price: toNumber(row.price),
    currency: parseId(row.currency),
    purchasePrice: toNumber(row.purchasePrice),
    purchaseCurrency: parseId(row.purchaseCurrency),
    barcodes: parseBarcodes(row),
    categories: parseCategories(row),
    unit: parseId(row.unit),
    productPropertiesGroup: parseId(row.productPropertiesGroup),
    productProperties: parseProductProperties(row).map(property => ({
      _id: property._id,
      value: property.value,
    })) || [],
    images: [],
    uploadedImages: [],
    generateBarcode: parseGenerateBarcode(row),
  }))

  const productsForEdit = parsedProducts.filter(product => product._id)
  const productsForCreate = parsedProducts.filter(product => !product._id)

  if (productsForEdit.length > 0) {
    const bulkProducts = productsForEdit.map(product => ({
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            names: product.names,
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

    await ProductModel.bulkWrite(bulkProducts)
  }

  if (productsForCreate.length > 0) {
    for (const product of productsForCreate) {
      const { data: createdProduct } = await ProductService.create({
        ...product,
        productProperties: product.productProperties.map(property => ({
          id: property._id,
          value: property.value as string | number | boolean | string[],
        })),
      })

      for (const barcode of product.barcodes) {
        await BarcodeService.create({
          code: barcode,
          products: [{ id: createdProduct.id.toString(), quantity: 1 }],
          active: true,
        })
      }
    }
  }

  const productIds = [...productsForEdit, ...productsForCreate].map(product => product?._id)

  return {
    status: 'success',
    code: 'PRODUCTS_IMPORTED',
    message: 'Products imported',
    productIds,
  }
}

export async function exportHandler(payload: ExportProductsParams, user?: User): Promise<ExportProductsResponse> {
  const { ids } = payload
  const language = 'ru'

  const languages = await LanguageModel.find({ active: true, removed: false })
  const currencies = await CurrencyModel.find({ active: true, removed: false })
  const units = await UnitModel.find({ active: true, removed: false })
  const categories = await CategoryModel.find({ active: true, removed: false })
  const productPropertiesGroups = await ProductPropertyGroupModel.find({ active: true, removed: false })
  const productProperties = await ProductPropertyModel.find({ active: true, removed: false })

  const hasPurchasePricePermission = await UserService.checkUserPermissions('product.purchasePrice', user)

  const workbook = new ExcelJS.Workbook()
  const hiddenSheet = workbook.addWorksheet('hidden')
  hiddenSheet.state = 'veryHidden'

  const selectedProducts = await get({ filters: { ids }, pagination: { full: true }, sorters: { seq: 'asc' } }, user)

  const groupedProducts: Record<string, any[]> = {}
  for (const product of selectedProducts.data.items) {
    const groupId = product.productPropertiesGroup.id.toString()
    if (!groupedProducts[groupId]) {
      groupedProducts[groupId] = []
    }
    groupedProducts[groupId].push(product)
  }

  for (const [groupId, products] of Object.entries(groupedProducts)) {
    const groupName = products[0].productPropertiesGroup.names[language] || groupId
    const sheet = workbook.addWorksheet(groupName)

    const productPropertiesIds = productPropertiesGroups.find(item => item.id === groupId)?.productProperties || []
    const productPropertiesData = productProperties.filter(item => productPropertiesIds.includes(item.id))

    const dynamicKeys: { key: string, header: string, id: string, type: string }[] = []
    const dynamicColumns: { key: string, header: string }[] = []
    productPropertiesData.forEach(({ type, id, names }: any) => {
      if (type === 'multiSelect') {
        for (let i = 1; i <= 5; i++) {
          const key = `${id}_${i}`
          dynamicColumns.push({
            header: `${names.get(language) || 'NO_NAME'}_${i} (${key})`,
            key,
          })
          dynamicKeys.push({
            key,
            id,
            header: `${names.get(language) || 'NO_NAME'}_${i} (${key})`,
            type,
          })
        }
      }
      else {
        dynamicColumns.push({
          header: `${names.get(language) || 'NO_NAME'} (${id})`,
          key: id,
        })
        dynamicKeys.push({
          key: id,
          header: `${names.get(language) || 'NO_NAME'} (${id})`,
          id,
          type,
        })
      }
    })

    sheet.columns = [
      { header: 'id', key: 'id' },
      { header: 'seq', key: 'seq' },
      { header: 'images', key: 'images' },
      ...languages.map(lang => ({
        header: `name_${lang.code}`,
        key: `name_${lang.code}`,
      })),
      { header: 'price', key: 'price' },
      { header: 'purchasePrice', key: 'purchasePrice' },
      { header: 'currency', key: 'currency' },
      { header: 'purchaseCurrency', key: 'purchaseCurrency' },
      { header: 'unit', key: 'unit' },
      { header: 'productPropertiesGroup', key: 'productPropertiesGroup' },
      { header: 'categories_1', key: 'categories_1' },
      { header: 'categories_2', key: 'categories_2' },
      { header: 'categories_3', key: 'categories_3' },
      { header: 'categories_4', key: 'categories_4' },
      { header: 'categories_5', key: 'categories_5' },
      { header: 'barcodes_1', key: 'barcodes_1' },
      { header: 'barcodes_2', key: 'barcodes_2' },
      { header: 'barcodes_3', key: 'barcodes_3' },
      { header: 'barcodes_4', key: 'barcodes_4' },
      { header: 'barcodes_5', key: 'barcodes_5' },
      ...dynamicColumns,
    ]

    products.forEach((product: any) => {
      const row: Record<string, any> = {}

      row.id = product.id
      row.seq = product.seq
      row.images = product.images.map((image: any) => `${STORAGE_URLS.productImages}/${image.filename}`).join(', ')
      for (const lang of languages) {
        row[`name_${lang.code}`] = product.names[lang.code] || ''
      }
      row.price = product.price
      if (hasPurchasePricePermission) {
        row.purchasePrice = product.purchasePrice
      }
      else {
        row.purchasePrice = ''
      }
      row.currency = `${product.currency.names[language] || 'NO_NAME'} (${product.currency.id})`
      if (hasPurchasePricePermission) {
        row.purchaseCurrency = `${product.purchaseCurrency.names[language] || 'NO_NAME'} (${product.purchaseCurrency.id})`
      }
      else {
        row.purchaseCurrency = ''
      }
      row.unit = `${product.unit.names[language] || 'NO_NAME'} (${product.unit.id})`
      row.productPropertiesGroup = `${product.productPropertiesGroup.names[language] || 'NO_NAME'} (${product.productPropertiesGroup.id})`
      for (let i = 1; i <= 5; i++) {
        row[`barcodes_${i}`] = product?.barcodes[i - 1] ? `${product?.barcodes[i - 1]?.code}` : ''
        row[`categories_${i}`] = product?.categories[i - 1] ? `${product?.categories[i - 1]?.names[language] || 'NO_NAME'} (${product?.categories[i - 1]?.id})` : ''
      }
      dynamicKeys.forEach(({ id, type, key }) => {
        const property = product.productProperties.find((item: any) => item.id === id)
        if (type === 'multiSelect') {
          const options = property?.optionData || []
          const index = Number.parseInt(key.split('_')[1], 10) - 1
          const option = options[index]
          row[key] = option ? `${option.names?.[language]} (${option.id})` : ''
        }
        else if (type === 'select' || type === 'color') {
          row[key] = property?.optionData?.[0]
            ? `${property?.optionData[0].names?.[language]} (${property?.optionData[0].id})`
            : ''
        }
        else {
          row[key] = property?.value || ''
        }
      })
      sheet.addRow(row)
    })

    createHiddenList({ data: currencies, columnKey: 'A', columnName: 'currency' })
    createHiddenList({ data: currencies, columnKey: 'A', columnName: 'purchaseCurrency' })
    createHiddenList({ data: units, columnKey: 'B', columnName: 'unit' })
    createHiddenList({ data: productPropertiesGroups, columnKey: 'C', columnName: 'productPropertiesGroup' })
    createHiddenList({ data: categories, columnKey: 'D', columnName: 'categories_1' })
    createHiddenList({ data: categories, columnKey: 'D', columnName: 'categories_2' })
    createHiddenList({ data: categories, columnKey: 'D', columnName: 'categories_3' })
    createHiddenList({ data: categories, columnKey: 'D', columnName: 'categories_4' })
    createHiddenList({ data: categories, columnKey: 'D', columnName: 'categories_5' })
    const propertiesLetters: Record<string, string> = {}
    for (const [index, property] of dynamicKeys.entries()) {
      if (['select', 'multiSelect', 'color'].includes(property.type)) {
        const { data: { items: productPropertiesOptions } } = await ProductPropertyOptionService.get({
          filters: { productProperty: property.id },
          pagination: { full: true },
        })
        if (!propertiesLetters[property.id])
          propertiesLetters[property.id] = getExcelColumnLetter(5 + index)

        createHiddenList({
          data: productPropertiesOptions,
          columnKey: propertiesLetters[property.id],
          columnName: property.key,
        })
      }
    }

    function createHiddenList({ data, columnKey, columnName }: { data: any[], columnKey: string, columnName: string }) {
      const options = data.map((item: any) => {
        const name = item.names.get(language) || 'NO_NAME'
        return `${name} (${item._id})`
      })

      options.forEach((value, index) => {
        hiddenSheet.getCell(`${columnKey}${index + 1}`).value = value
      })

      const formulaRange = `hidden!$${columnKey}$1:$${columnKey}$${options.length}`
      const column = sheet.columns.findIndex(col => col.key === columnName) + 1

      for (let i = 2; i <= sheet.rowCount; i++) {
        sheet.getCell(i, column).dataValidation = {
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

export async function downloadTemplate(user?: User): Promise<DownloadTemplateResponse> {
  const language = 'en'

  const languages = await LanguageModel.find({ active: true, removed: false })
  const currencies = await CurrencyModel.find({ active: true, removed: false })
  const units = await UnitModel.find({ active: true, removed: false })
  const categories = await CategoryModel.find({ active: true, removed: false })
  const productPropertiesGroups = await ProductPropertyGroupModel.find({ active: true, removed: false })
  const productProperties = await ProductPropertyModel.find({ active: true, removed: false })

  const hasPurchasePricePermission = await UserService.checkUserPermissions('product.purchasePrice', user)

  const workbook = new ExcelJS.Workbook()
  const hiddenSheet = workbook.addWorksheet('hidden')
  hiddenSheet.state = 'veryHidden'

  const { data: { items: selectedProducts } } = await get({ pagination: { current: 1, pageSize: 1 }, sorters: {} }, user)

  const groupedProducts: Record<string, any[]> = {}
  for (const product of selectedProducts) {
    const groupId = product.productPropertiesGroup.id.toString()
    if (!groupedProducts[groupId]) {
      groupedProducts[groupId] = []
    }
    groupedProducts[groupId].push(product)
  }

  for (const [groupId, products] of Object.entries(groupedProducts)) {
    const groupName = products[0].productPropertiesGroup.names[language] || groupId
    const sheet = workbook.addWorksheet(groupName)

    const productPropertiesIds = productPropertiesGroups.find(item => item.id === groupId)?.productProperties || []
    const productPropertiesData = productProperties.filter(item => productPropertiesIds.includes(item.id))

    const dynamicKeys: { key: string, header: string, id: string, type: string }[] = []
    const dynamicColumns: { key: string, header: string }[] = []
    productPropertiesData.forEach(({ type, id, names }: any) => {
      if (type === 'multiSelect') {
        for (let i = 1; i <= 5; i++) {
          const key = `${id}_${i}`
          dynamicColumns.push({
            header: `${names.get(language) || 'NO_NAME'}_${i} (${key})`,
            key,
          })
          dynamicKeys.push({
            key,
            id,
            header: `${names.get(language) || 'NO_NAME'}_${i} (${key})`,
            type,
          })
        }
      }
      else {
        dynamicColumns.push({
          header: `${names.get(language) || 'NO_NAME'} (${id})`,
          key: id,
        })
        dynamicKeys.push({
          key: id,
          header: `${names.get(language) || 'NO_NAME'} (${id})`,
          id,
          type,
        })
      }
    })

    sheet.columns = [
      { header: 'id', key: 'id' },
      { header: 'seq', key: 'seq' },
      { header: 'images', key: 'images' },
      ...languages.map(lang => ({
        header: `name_${lang.code}`,
        key: `name_${lang.code}`,
      })),
      { header: 'price', key: 'price' },
      { header: 'purchasePrice', key: 'purchasePrice' },
      { header: 'currency', key: 'currency' },
      { header: 'purchaseCurrency', key: 'purchaseCurrency' },
      { header: 'unit', key: 'unit' },
      { header: 'productPropertiesGroup', key: 'productPropertiesGroup' },
      { header: 'categories_1', key: 'categories_1' },
      { header: 'categories_2', key: 'categories_2' },
      { header: 'categories_3', key: 'categories_3' },
      { header: 'categories_4', key: 'categories_4' },
      { header: 'categories_5', key: 'categories_5' },
      { header: 'barcodes_1', key: 'barcodes_1' },
      { header: 'barcodes_2', key: 'barcodes_2' },
      { header: 'barcodes_3', key: 'barcodes_3' },
      { header: 'barcodes_4', key: 'barcodes_4' },
      { header: 'barcodes_5', key: 'barcodes_5' },
      { header: 'generateBarcode', key: 'generateBarcode' },
      ...dynamicColumns,
    ]

    products.forEach((product: any) => {
      const row: Record<string, any> = {}

      row.id = product.id
      row.seq = product.seq
      row.generateBarcode = 'NO'
      row.images = product.images.map((image: any) => `${STORAGE_URLS.productImages}/${image.filename}`).join(', ')
      for (const lang of languages) {
        row[`name_${lang.code}`] = product.names[lang.code] || ''
      }
      row.price = product.price
      row.purchasePrice = product.purchasePrice
      row.currency = `${product.currency.names[language] || 'NO_NAME'} (${product.currency.id})`
      if (hasPurchasePricePermission) {
        row.purchaseCurrency = `${product.purchaseCurrency.names[language] || 'NO_NAME'} (${product.purchaseCurrency.id})`
      }
      else {
        row.purchaseCurrency = ''
      }
      row.unit = `${product.unit.names[language] || 'NO_NAME'} (${product.unit.id})`
      row.productPropertiesGroup = `${product.productPropertiesGroup.names[language] || 'NO_NAME'} (${product.productPropertiesGroup.id})`
      for (let i = 1; i <= 5; i++) {
        row[`categories_${i}`] = product?.categories[i - 1] ? `${product?.categories[i - 1]?.names[language] || 'NO_NAME'} (${product?.categories[i - 1]?.id})` : ''
        row[`barcodes_${i}`] = product?.barcodes[i - 1] ? `${product?.barcodes[i - 1]?.code}` : ''
      }
      dynamicKeys.forEach(({ id, type, key }) => {
        const property = product.productProperties.find(
          (item: any) => (item.id || item._id)?.toString() === id.toString(),
        )
        if (type === 'multiSelect') {
          const options = property?.optionData || []
          const index = Number.parseInt(key.split('_')[1], 10) - 1
          const option = options[index]
          row[key] = option ? `${option.names?.[language]} (${option.id})` : ''
        }
        else if (type === 'select' || type === 'color') {
          row[key] = property?.optionData?.[0]
            ? `${property?.optionData[0].names?.[language]} (${property?.optionData[0].id})`
            : ''
        }
        else {
          row[key] = property?.value || ''
        }
      })
      sheet.addRow(row)
    })

    createHiddenList({ data: currencies, columnKey: 'A', columnName: 'currency' })
    createHiddenList({ data: currencies, columnKey: 'A', columnName: 'purchaseCurrency' })
    createHiddenList({ data: units, columnKey: 'B', columnName: 'unit' })
    createHiddenList({ data: productPropertiesGroups, columnKey: 'C', columnName: 'productPropertiesGroup' })
    createHiddenList({ data: categories, columnKey: 'D', columnName: 'categories_1' })
    createHiddenList({ data: categories, columnKey: 'D', columnName: 'categories_2' })
    createHiddenList({ data: categories, columnKey: 'D', columnName: 'categories_3' })
    createHiddenList({ data: categories, columnKey: 'D', columnName: 'categories_4' })
    createHiddenList({ data: categories, columnKey: 'D', columnName: 'categories_5' })
    createHiddenListTrueFalse({ columnKey: 'E', columnName: 'generateBarcode' })
    const propertiesLetters: Record<string, string> = {}
    for (const [index, property] of dynamicKeys.entries()) {
      if (['select', 'multiSelect', 'color'].includes(property.type)) {
        const { data: { items: productPropertiesOptions } } = await ProductPropertyOptionService.get({
          filters: { productProperty: property.id },
          pagination: { full: true },
        })
        if (!propertiesLetters[property.id])
          propertiesLetters[property.id] = getExcelColumnLetter(5 + index)

        createHiddenList({
          data: productPropertiesOptions,
          columnKey: propertiesLetters[property.id],
          columnName: property.key,
        })
      }
    }

    function createHiddenList({ data, columnKey, columnName }: { data: any[], columnKey: string, columnName: string }) {
      const options = data.map((item: any) => {
        const name = item.names.get(language) || 'NO_NAME'
        return `${name} (${item._id})`
      })

      options.forEach((value, index) => {
        hiddenSheet.getCell(`${columnKey}${index + 1}`).value = value
      })

      const formulaRange = `hidden!$${columnKey}$1:$${columnKey}$${options.length}`
      const column = sheet.columns.findIndex(col => col.key === columnName) + 1

      for (let i = 2; i <= sheet.rowCount; i++) {
        sheet.getCell(i, column).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [formulaRange],
        }
      }
    }

    function createHiddenListTrueFalse({ columnKey, columnName }: { columnKey: string, columnName: string }) {
      const data = [{ id: 'YES' }, { id: 'NO' }]
      const options = data.map((item: any) => item.id)

      options.forEach((value, index) => {
        hiddenSheet.getCell(`${columnKey}${index + 1}`).value = value
      })

      const formulaRange = `hidden!$${columnKey}$1:$${columnKey}$${options.length}`
      const column = sheet.columns.findIndex(col => col.key === columnName) + 1

      for (let i = 2; i <= sheet.rowCount; i++) {
        sheet.getCell(i, column).dataValidation = {
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
  }

  await workbook.xlsx.writeFile(path.join(STORAGE_PATHS.exportProducts, `${uuidv4()}.xlsx`))

  const buffer = await workbook.xlsx.writeBuffer()

  return {
    status: 'success',
    code: 'PRODUCTS_TEMPLATE_DOWNLOADED',
    message: 'Products template downloaded',
    buffer: Buffer.from(buffer),
  }
}

function normalizeProduct(product: any) {
  if (!product)
    return null

  // оставляем только нужные для синка поля
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
  } = product

  return {
    names: names instanceof Map ? Object.fromEntries(names) : names,
    price,
    purchasePrice,
    currency,
    categories: Array.isArray(categories) ? [...categories].sort() : [],
    purchaseCurrency,
    productPropertiesGroup,
    productProperties: Array.isArray(productProperties)
      ? productProperties
        .map((p: any) => ({ _id: p._id, value: p.value }))
        .sort((a, b) => a._id.localeCompare(b._id))
      : [],
    unit,
    images: Array.isArray(images)
      ? images.map((img: any) => ({
        id: img.id,
        path: img.path,
        filename: img.filename,
        name: img.name,
        type: img.type,
      }))
      : [],
  }
}
