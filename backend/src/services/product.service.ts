import type * as ProductTypes from '../types/product.type'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import ExcelJS from 'exceljs'
import { v4 as uuidv4 } from 'uuid'
import { STORAGE_PATHS, STORAGE_URLS } from '../config/constants'
import { LanguageModel } from '../models'
import { ProductModel } from '../models/product.model'
import { HttpError } from '../utils/httpError'
import {
  extractLangMap,
  parseFile,
  toNumber,
} from '../utils/parseTools'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: ProductTypes.getProductsParams): Promise<ProductTypes.getProductsResult> {
  const { current = 1, pageSize = 10 } = payload.pagination

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
  } = payload.filters

  const sorters = buildSortQuery(payload.sorters)

  const filterRules = {
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
  } as const

  const query = buildQuery({
    filters: { names, price, purchasePrice, barcodes, categories, unit, productPropertiesGroup, productProperties, createdAt, updatedAt },
    rules: filterRules,
    language,
  })

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    { $unwind: { path: '$productProperties', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'product-properties',
        localField: 'productProperties._id',
        foreignField: '_id',
        as: 'productProperties.data',
      },
    },
    {
      $lookup: {
        from: 'product-property-options',
        localField: 'productProperties.value',
        foreignField: '_id',
        as: 'productProperties.optionData',
      },
    },
    {
      $lookup: {
        from: 'product-property-options',
        let: { valueArr: '$productProperties.value' },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: [
                  '$_id',
                  {
                    $cond: [
                      { $isArray: ['$$valueArr'] },
                      '$$valueArr',
                      [{ $ifNull: ['$$valueArr', null] }],
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'productProperties.optionData',
      },
    },
    {
      $group: {
        _id: '$_id',
        doc: { $first: '$$ROOT' },
        productProperties: { $push: '$productProperties' },
      },
    },
    {
      $addFields: {
        'doc.productProperties': '$productProperties',
      },
    },
    {
      $replaceRoot: {
        newRoot: '$doc',
      },
    },
    {
      $lookup: {
        from: 'currencies',
        localField: 'currency',
        foreignField: '_id',
        as: 'currency',
      },
    },
    {
      $lookup: {
        from: 'currencies',
        localField: 'purchaseCurrency',
        foreignField: '_id',
        as: 'purchaseCurrency',
      },
    },
    {
      $lookup: {
        from: 'units',
        localField: 'unit',
        foreignField: '_id',
        as: 'unit',
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categories',
        foreignField: '_id',
        as: 'categories',
      },
    },
    {
      $lookup: {
        from: 'product-property-groups',
        localField: 'productPropertiesGroup',
        foreignField: '_id',
        as: 'productPropertiesGroup',
      },
    },
    {
      $addFields: {
        currency: { $arrayElemAt: ['$currency', 0] },
        purchaseCurrency: { $arrayElemAt: ['$purchaseCurrency', 0] },
        unit: { $arrayElemAt: ['$unit', 0] },
        productPropertiesGroup: { $arrayElemAt: ['$productPropertiesGroup', 0] },
        productProperties: {
          $map: {
            input: '$productProperties',
            as: 'prop',
            in: {
              $mergeObjects: [
                '$$prop',
                {
                  id: '$$prop._id',
                  data: { $arrayElemAt: ['$$prop.data', 0] },
                  optionData: {
                    $map: {
                      input: '$$prop.optionData',
                      as: 'option',
                      in: {
                        $mergeObjects: [
                          '$$option',
                          {
                            id: '$$option._id',
                            names: '$$option.names',
                            color: '$$option.color',
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          },
        },
        categories: {
          $map: {
            input: '$categories',
            as: 'prop',
            in: {
              $mergeObjects: [
                '$$prop',
                {
                  id: '$$prop._id',
                },
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        names: 1,
        price: 1,
        currency: { id: '$currency._id', names: 1, symbols: 1 },
        purchasePrice: 1,
        purchaseCurrency: { id: '$purchaseCurrency._id', names: 1, symbols: 1 },
        barcodes: 1,
        categories: { id: 1, names: 1 },
        unit: { id: '$unit._id', names: 1, symbols: 1 },
        images: 1,
        productProperties: { id: 1, value: 1, data: { names: 1, type: 1, isRequired: 1, showInTable: 1 }, optionData: { id: 1, names: 1, color: 1 } },
        productPropertiesGroup: { id: '$productPropertiesGroup._id', names: 1 },
        createdAt: 1,
        updatedAt: 1,
        id: '$_id',
      },
    },
    {
      $facet: {
        products: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const productsRaw = await ProductModel.aggregate(pipeline).exec()

  let products = productsRaw[0].products
  const productsCount = productsRaw[0].totalCount[0]?.count || 0

  products = products.map((product: ProductTypes.Product) => ({
    ...product,
    images: product.images.map((image: any) => ({
      id: image._id,
      path: `${STORAGE_URLS.productImages}/${image.filename}`,
      filename: image.filename,
      name: image.name,
      type: image.type,
    })),
  }))

  return { status: 'success', code: 'PRODUCTS_FETCHED', message: 'Products fetched', products, productsCount }
}

export async function create(payload: ProductTypes.createProductParams): Promise<ProductTypes.createProductResult> {
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
  } = payload

  const parsedProductProperties = productProperties.map(property => ({
    _id: property.id,
    value: property.value,
  }))

  const parsedUploadedImages = uploadedImages.map((image: any) => ({
    filename: image.filename,
    name: image.originalname,
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

  return { status: 'success', code: 'PRODUCT_CREATED', message: 'Product created', product }
}

export async function edit(payload: ProductTypes.editProductParams): Promise<ProductTypes.editProductResult> {
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
  } = payload

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
    name: uploadedImages[index].originalname,
    type: uploadedImages[index].mimetype,
  }))

  const parsedImages = images.map((image: any) => {
    if (image.isNew) {
      const newImage = parsedUploadedImages.find((uploadedImage: any) => uploadedImage.id === image.id) as any

      return ({
        id: uuidv4(),
        path: newImage.path,
        filename: newImage.filename,
        name: newImage.name,
        type: newImage.type,
      })
    }
    const pathName = new URL(image.path).pathname
    return ({
      id: image.id,
      path: path.join(path.resolve(), pathName),
      filename: image.filename,
      name: image.name,
      type: image.type,
    })
  })

  const product = await ProductModel.findOneAndUpdate({ _id: id }, {
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
  })

  if (!product) {
    throw new HttpError(400, 'Product not edited', 'PRODUCT_NOT_EDITED')
  }

  return { status: 'success', code: 'PRODUCT_EDITED', message: 'Product edited', product }
}

export async function remove(payload: ProductTypes.removeProductsParams): Promise<ProductTypes.removeProductsResult> {
  const { ids } = payload

  const products = await ProductModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!products) {
    throw new HttpError(400, 'Products not removed', 'PRODUCTS_NOT_REMOVED')
  }

  return { status: 'success', code: 'PRODUCTS_REMOVED', message: 'Products removed' }
}

export async function batch(payload: ProductTypes.batchProductsParams): Promise<ProductTypes.batchProductsResult> {
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

  const allowedParams = ['names', 'price', 'purchasePrice', 'barcodes', 'categories', 'unit', 'productPropertiesGroup', 'productProperties']

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
    unit: { type: 'exact' },
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

  return { status: 'success', code: 'PRODUCTS_BATCH_EDITED', message: 'Products batch edited' }
}

export async function duplicate(payload: ProductTypes.duplicateProductParams): Promise<ProductTypes.duplicateProductResult> {
  const { ids } = payload

  const products = await ProductModel.find({ _id: { $in: ids } })

  const parsedProducts = products.map(product => ({
    names: product.names,
    price: product.price,
    purchasePrice: product.purchasePrice,
    barcodes: product.barcodes,
    categories: product.categories,
    unit: product.unit,
    productPropertiesGroup: product.productPropertiesGroup,
    productProperties: product.productProperties,
  }))

  await ProductModel.create(parsedProducts)

  return { status: 'success', code: 'PRODUCTS_DUPLICATED', message: 'Products duplicated' }
}

export async function importHandler(payload: ProductTypes.importProductsParams): Promise<ProductTypes.importProductsResult> {
  const { file } = payload

  const storedFile = await parseFile(file.path)

  const parsedProducts = storedFile.map(row => ({
    _id: row.id || undefined,
    names: extractLangMap(row, 'name'),
    price: toNumber(row.price),
    purchasePrice: toNumber(row.purchasePrice),
    barcodes: row.barcodes,
    categories: row.categories,
    unit: row.unit,
    productPropertiesGroup: row.productPropertiesGroup,
    productProperties: row.productProperties,
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
            purchasePrice: product.purchasePrice,
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
    await ProductModel.create(productsForCreate)
  }

  const productIds = [...productsForEdit, ...productsForCreate].map(product => product?._id)

  return { status: 'success', code: 'PRODUCTS_IMPORTED', message: 'Products imported', productIds }
}

export async function exportHandler(payload: ProductTypes.exportProductsParams): Promise<ProductTypes.exportProductsResult> {
  const { ids } = payload
  console.log(ids)

  const userLanguage = 'ru'

  const languages = await LanguageModel.find({ active: true, removed: false })
  const products = await ProductModel.find({ active: true, removed: false })

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Products')

  sheet.columns = [
    { header: 'id', key: 'id' },
    ...languages.map(lang => ({
      header: `name_${lang.code}`,
      key: `name_${lang.code}`,
    })),
    { header: 'price', key: 'price' },
    { header: 'purchasePrice', key: 'purchasePrice' },
    { header: 'barcodes', key: 'barcodes' },
    { header: 'categories', key: 'categories' },
    { header: 'unit', key: 'unit' },
    { header: 'productPropertiesGroup', key: 'productPropertiesGroup' },
    { header: 'productProperties', key: 'productProperties' },
  ]

  // if ((ids || []).length > 0) {
  //   const selectedProducts = await ProductModel.find({ _id: { $in: ids } })
  //   selectedProducts.forEach((product) => {
  //     const row: Record<string, any> = {}
  //     row.id = product._id

  //     for (const lang of languages) {
  //       row[`name_${lang.code}`] = (product.names as Map<string, string>).get(lang.code) || ''
  //     }

  //     const parentProduct = products.find(p => p._id.toString() === product.parent?.toString())
  //     const parentName = parentProduct
  //       ? `${parentProduct.names.get(userLanguage) || 'NO_NAME'} (${parentProduct._id})`
  //       : ''

  //     row.parent = parentName
  //     row.price = product.price
  //     row.purchasePrice = product.purchasePrice
  //     row.barcodes = product.barcodes
  //     row.categories = product.categories
  //     row.unit = product.unit
  //     row.productPropertiesGroup = product.productPropertiesGroup
  //     row.productProperties = product.productProperties

  //     sheet.addRow(row)
  //   })
  // }
  // else {
  //   sheet.addRow({
  //     ...languages.map(lang => ({
  //       [`name_${lang.code}`]: `name.${lang.code}`,
  //     })),
  //     parent: '1',
  //     priority: 1,
  //     active: true,
  //   })
  // }

  const parentOptions = products.map((product) => {
    const name = product.names.get(userLanguage) || 'NO_NAME'
    return `${name} (${product._id})`
  })

  const hiddenSheet = workbook.addWorksheet('ParentOptions')
  hiddenSheet.state = 'veryHidden'

  parentOptions.forEach((value, index) => {
    hiddenSheet.getCell(`A${index + 1}`).value = value
  })

  const formulaRange = `ParentOptions!$A$1:$A$${parentOptions.length}`
  const parentCol = sheet.columns.findIndex(col => col.key === 'parent') + 1

  for (let i = 2; i <= sheet.rowCount; i++) {
    sheet.getCell(i, parentCol).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [formulaRange],
    }
  }

  await workbook.xlsx.writeFile(path.join(STORAGE_PATHS.exportProducts, `${uuidv4()}.xlsx`))

  const buffer = await workbook.xlsx.writeBuffer()

  return { status: 'success', code: 'PRODUCTS_EXPORTED', message: 'Products exported', buffer: Buffer.from(buffer) }
}
