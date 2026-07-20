import type * as BarcodeTypes from '../types/barcode.type'

import path from 'node:path'
import bwipjs from 'bwip-js'
import PDFDocument from 'pdfkit'
import { STORAGE_URLS } from '../config/constants'
import { BarcodeModel, CounterModel } from '../models/'
import { ProductModel } from '../models/product.model'
import { HttpError } from '../utils/httpError'
import { getHardcodeData } from '../utils/mongodb/hardcode'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'
import * as AuditLogsService from './audit-logs.service'

export async function get(
  payload: BarcodeTypes.getBarcodesParams,
): Promise<BarcodeTypes.getBarcodesResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}
  console.log(payload)
  const {
    ids = [],
    codes = [],
    products = [],
    active = undefined,
    createdAt = {
      from: undefined,
      to: undefined,
    },
    updatedAt = {
      from: undefined,
      to: undefined,
    },
  } = payload.filters || {}

  const filterRules = {
    _id: { type: 'array' },
    code: { type: 'array' },
    products: { type: 'array' },
    active: { type: 'array' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { _id: ids, code: codes, products, active, createdAt, updatedAt },
    rules: filterRules,
  })

  const sorters = buildSortQuery(payload.sorters || {}, { code: 1 })

  // const pipeline = [
  //   {
  //     $match: query,
  //   },
  //   {
  //     $sort: sorters,
  //   },
  //   // { $unwind: '$products' },
  //   // {
  //   //   $lookup: {
  //   //     from: 'products',
  //   //     localField: 'products._id',
  //   //     foreignField: '_id',
  //   //     as: 'productInfo',
  //   //   },
  //   // },
  //   // { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
  //   // {
  //   //   $group: {
  //   //     _id: '$_id',
  //   //     code: { $first: '$code' },
  //   //     products: {
  //   //       $push: {
  //   //         $mergeObjects: [
  //   //           { _id: '$products._id', quantity: '$products.quantity' },
  //   //           '$productInfo',
  //   //         ],
  //   //       },
  //   //     },
  //   //     active: { $first: '$active' },
  //   //     removed: { $first: '$removed' },
  //   //     createdAt: { $first: '$createdAt' },
  //   //     updatedAt: { $first: '$updatedAt' },
  //   //   },
  //   // },
  //   {
  //     $facet: {
  //       barcodes: [
  //         { $skip: (current - 1) * pageSize },
  //         { $limit: pageSize },
  //       ],
  //       totalCount: [
  //         { $count: 'count' },
  //       ],
  //     },
  //   },
  // ]

  const pipeline = [
    { $match: query },
    { $unwind: '$products' },
    {
      $lookup: {
        from: 'products',
        localField: 'products._id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    {
      $unwind: {
        path: '$product.productProperties',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'product-properties',
        localField: 'product.productProperties._id',
        foreignField: '_id',
        as: 'product.productProperties.data',
      },
    },
    {
      $lookup: {
        from: 'product-property-options',
        localField: 'product.productProperties.value',
        foreignField: '_id',
        as: 'product.productProperties.optionData',
      },
    },
    {
      $group: {
        _id: {
          barcode: '$_id',
          product: '$product._id',
        },
        doc: { $first: '$$ROOT' },
        productProperties: { $push: '$product.productProperties' },
      },
    },
    {
      $addFields: {
        'doc.product.productProperties': '$productProperties',
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
        localField: 'product.currency',
        foreignField: '_id',
        as: 'product.currency',
      },
    },
    {
      $addFields: {
        'product.currency': {
          $arrayElemAt: ['$product.currency', 0],
        },
      },
    },
    {
      $lookup: {
        from: 'currencies',
        localField: 'product.purchaseCurrency',
        foreignField: '_id',
        as: 'product.purchaseCurrency',
      },
    },
    {
      $addFields: {
        'product.purchaseCurrency': {
          $arrayElemAt: ['$product.purchaseCurrency', 0],
        },
      },
    },
    {
      $lookup: {
        from: 'units',
        localField: 'product.unit',
        foreignField: '_id',
        as: 'product.unit',
      },
    },
    { $addFields: { 'product.unit': { $arrayElemAt: ['$product.unit', 0] } } },
    {
      $lookup: {
        from: 'categories',
        localField: 'product.categories',
        foreignField: '_id',
        as: 'product.categories',
      },
    },
    {
      $lookup: {
        from: 'product-property-groups',
        localField: 'product.productPropertiesGroup',
        foreignField: '_id',
        as: 'product.productPropertiesGroup',
      },
    },
    {
      $addFields: {
        'product.productPropertiesGroup': {
          $arrayElemAt: ['$product.productPropertiesGroup', 0],
        },
      },
    },
    {
      $group: {
        _id: '$_id',
        code: { $first: '$code' },
        active: { $first: '$active' },
        removed: { $first: '$removed' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        products: {
          $push: {
            $mergeObjects: [
              '$product',
              { _id: '$products._id', quantity: '$products.quantity' },
            ],
          },
        },
      },
    },
    {
      $addFields: {
        products: {
          $map: {
            input: '$products',
            as: 'product',
            in: {
              id: '$$product._id',
              quantity: '$$product.quantity',
              names: '$$product.names',
              price: '$$product.price',
              currency: {
                id: '$$product.currency._id',
                names: '$$product.currency.names',
                symbols: '$$product.currency.symbols',
              },
              purchasePrice: '$$product.purchasePrice',
              purchaseCurrency: {
                id: '$$product.purchaseCurrency._id',
                names: '$$product.purchaseCurrency.names',
                symbols: '$$product.purchaseCurrency.symbols',
              },
              barcodes: '$$product.barcodes',
              categories: {
                $map: {
                  input: '$$product.categories',
                  as: 'cat',
                  in: { id: '$$cat._id', names: '$$cat.names' },
                },
              },
              unit: {
                id: '$$product.unit._id',
                names: '$$product.unit.names',
                symbols: '$$product.unit.symbols',
              },
              images: '$$product.images',
              productProperties: {
                $map: {
                  input: '$$product.productProperties',
                  as: 'prop',
                  in: {
                    id: '$$prop._id',
                    value: '$$prop.value',
                    data: {
                      names: '$$prop.data.names',
                      type: '$$prop.data.type',
                      isRequired: '$$prop.data.isRequired',
                      showInTable: '$$prop.data.showInTable',
                    },
                    optionData: {
                      $map: {
                        input: '$$prop.optionData',
                        as: 'option',
                        in: {
                          id: '$$option._id',
                          names: '$$option.names',
                          color: '$$option.color',
                        },
                      },
                    },
                  },
                },
              },
              productPropertiesGroup: {
                id: '$$product.productPropertiesGroup._id',
                names: '$$product.productPropertiesGroup.names',
              },
              createdAt: '$$product.createdAt',
              updatedAt: '$$product.updatedAt',
              // id: '$$product._id',
            },
          },
        },
      },
    },
    { $sort: sorters },
    {
      $facet: {
        barcodes: [{ $skip: (current - 1) * pageSize }, { $limit: pageSize }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]

  const barcodesRaw = await BarcodeModel.aggregate(pipeline).exec()

  let barcodes = barcodesRaw[0].barcodes
  const barcodesCount = barcodesRaw[0].totalCount[0]?.count || 0

  if (barcodes.length > 0) {
    barcodes = barcodes.map((barcode: any) => ({
      ...barcode,
      _id: undefined,
      id: barcode._id,
      products: barcode.products.map((product: any) => ({
        ...product,
        images: (product.images || []).map((image: any) => ({
          id: image._id,
          path: `${STORAGE_URLS.productImages}/${image.filename}`,
          filename: image.filename,
          name: image.name,
          type: image.type,
        })),
      })),
    }))
  }

  if (barcodes.length === 0) {
    return {
      status: 'success',
      code: 'BARCODES_FETCHED_EMPTY',
      message: 'Zero barcodes fetched',
      barcodes,
      barcodesCount,
    }
  }

  return {
    status: 'success',
    code: 'BARCODES_FETCHED',
    message: 'Barcodes fetched',
    barcodes,
    barcodesCount,
  }
}

export async function create(
  payload: BarcodeTypes.createBarcodeParams,
): Promise<BarcodeTypes.createBarcodeResult> {
  let { code, products, active } = payload

  const parsedProducts = products.map((product: any) => ({
    _id: product.id,
    quantity: product.quantity,
  }))

  if (code === undefined || code.length === 0) {
    const { barcode: generatedCode } = await generateCode()
    code = generatedCode
  }

  const barcode = await BarcodeModel.create({
    code,
    products: parsedProducts,
    active,
  })

  await ProductModel.updateMany(
    { _id: { $in: parsedProducts.map(product => product._id) } },
    { $push: { barcodes: barcode._id } },
  )

  AuditLogsService.create({
    resourceType: 'barcode',
    resourceId: barcode._id.toString(),
    action: 'create',
    changes: [
      { path: 'code', before: null, after: code },
      { path: 'products', before: null, after: parsedProducts },
      { path: 'active', before: null, after: active },
    ],
  })

  return {
    status: 'success',
    code: 'BARCODE_CREATED',
    message: 'Barcode created',
    barcode,
  }
}

export async function generateCode(): Promise<BarcodeTypes.generateCodeResult> {
  const counter = (await CounterModel.findOne({ _id: 'barcodes' })) || {
    seq: 0,
  }
  const seq = counter.seq + 1

  const code = `224${seq.toString().padStart(10, '0')}`

  return {
    status: 'success',
    code: 'BARCODE_CODE_GENERATED',
    message: 'Barcode code generated',
    barcode: code,
  }
}

export async function edit(
  payload: BarcodeTypes.editBarcodeParams,
): Promise<BarcodeTypes.editBarcodeResult> {
  const { id, code, products, active } = payload

  const parsedProducts = products.map((product: any) => ({
    _id: product.id,
    quantity: product.quantity,
  }))

  await ProductModel.updateMany(
    { barcodes: { $in: [id] } },
    { $pull: { barcodes: { $in: [id] } } },
  )

  const barcode = await BarcodeModel.findOneAndUpdate(
    { _id: id },
    { code, products: parsedProducts, active },
  )

  await ProductModel.updateMany(
    { _id: { $in: parsedProducts.map(product => product._id) } },
    { $push: { barcodes: id } },
  )

  if (!barcode) {
    throw new HttpError(400, 'Barcode not edited', 'BARCODE_NOT_EDITED')
  }

  AuditLogsService.create({
    resourceType: 'barcode',
    resourceId: id.toString(),
    action: 'edit',
    changes: [
      { path: 'code', before: barcode.code, after: code },
      { path: 'products', before: barcode.products, after: parsedProducts },
      { path: 'active', before: barcode.active, after: active },
    ],
  })

  return {
    status: 'success',
    code: 'BARCODE_EDITED',
    message: 'Barcode edited',
    barcode,
  }
}

export async function remove(
  payload: BarcodeTypes.removeBarcodesParams,
): Promise<BarcodeTypes.removeBarcodesResult> {
  const { ids } = payload

  const barcodes = await BarcodeModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  await ProductModel.updateMany(
    { barcodes: { $in: ids } },
    { $pull: { barcodes: { $in: ids } } },
  )

  if (!barcodes) {
    throw new HttpError(400, 'Barcodes not removed', 'BARCODES_NOT_REMOVED')
  }

  for (const id of ids) {
    const barcode = await BarcodeModel.findOneAndUpdate(
      { _id: id },
      { removed: true },
    )

    if (!barcode) {
      continue
    }

    AuditLogsService.create({
      resourceType: 'barcode',
      resourceId: id.toString(),
      action: 'remove',
      changes: [
        { path: 'code', before: barcode.code, after: null },
        { path: 'products', before: barcode.products, after: null },
        { path: 'active', before: barcode.active, after: null },
        { path: 'removed', before: false, after: true },
      ],
    })
  }

  return {
    status: 'success',
    code: 'BARCODES_REMOVED',
    message: 'Barcodes removed',
  }
}

export async function print(
  payload: BarcodeTypes.printBarcodeParams,
): Promise<BarcodeTypes.printBarcodeResult> {
  const { ids, codes, size = '20x30', language = 'en' } = payload

  const { barcodes } = await get({
    filters: { ids, codes },
    pagination: { full: true },
    sorters: {},
  })

  if (barcodes.length === 0) {
    throw new HttpError(400, 'Barcodes not found', 'BARCODES_NOT_FOUND')
  }

  if (size === '60x30') {
    return await print60x30({ barcodes, size, language })
  }

  // if (size === '55x40') {
  //   return await print55x40({ barcodes, size, language })
  // }

  return await print55x40({ barcodes, size, language })
}

// async function print20x30(payload: { barcodes: any[], size: string, language: string }): Promise<BarcodeTypes.printBarcodeResult> {
//   const { barcodes, size, language } = payload
//   const [w, h] = size.split('x').map(Number)
//   const padding = 10
//   const contentWidth = w * 8.49 - padding * 2
//   const contentHeight = h * 8.49 - padding * 2

//   const doc = new PDFDocument({ autoFirstPage: false })

//   doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
//   doc.font('Manrope')

//   for (const barcode of barcodes) {
//     const product = barcode?.products?.[0]
//     if (!product)
//       continue

//     doc.fontSize(18)
//     doc.addPage({
//       size: [w * 8.49, h * 8.49],
//     })

//     const barcodePng = await bwipjs.toBuffer({
//       bcid: 'code128',
//       text: barcode.code,
//       scale: 8,
//       height: 20,
//       includetext: false,
//       textxalign: 'center',
//     })

//     doc.image(
//       barcodePng,
//       padding,
//       padding,
//       { width: contentWidth, height: contentHeight / 2 },
//     )

//     doc.text(
//       barcode.code,
//       padding,
//       contentHeight / 2 + 15,
//       { width: contentWidth, height: 25, align: 'center', ellipsis: true, lineBreak: false },
//     )

//     const productsText = barcode.products.map((product: any) => product.names[language] || '').join(', ')

//     doc.text(
//       productsText,
//       padding,
//       doc.y,
//       { width: contentWidth, height: 50, ellipsis: true, lineBreak: false },
//     )
//   }

//   return { status: 'success', code: 'BARCODE_PRINTED', message: 'Barcode printed', doc }
// }

async function print60x30(payload: {
  barcodes: any[]
  size: string
  language: string
}): Promise<BarcodeTypes.printBarcodeResult> {
  const { barcodes, size, language } = payload
  const [w, h] = size.split('x').map(Number)
  const padding = 10
  const contentWidth = w * 8.49 - padding * 2
  const contentHeight = h * 8.49 - padding * 2

  const doc = new PDFDocument({ autoFirstPage: false })

  doc.registerFont(
    'Manrope',
    path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'),
  )
  doc.font('Manrope')

  for (const barcode of barcodes) {
    const product = barcode?.products?.[0]
    if (!product) {
      continue
    }

    doc.fontSize(25)
    doc.addPage({
      size: [w * 8.49, h * 8.49],
    })

    const barcodePng = await bwipjs.toBuffer({
      bcid: 'code128',
      text: barcode.code,
      scale: 8,
      height: 20,
      includetext: false,
      textxalign: 'center',
    })

    doc.image(barcodePng, padding, padding, {
      width: contentWidth,
      height: contentHeight / 2,
    })

    doc.text(barcode.code, padding, contentHeight / 2 + 10, {
      width: contentWidth,
      height: 25,
      align: 'center',
      ellipsis: true,
      lineBreak: false,
    })

    doc.text(product.names[language], padding, doc.y, {
      width: contentWidth,
      height: 50,
      ellipsis: true,
      lineBreak: false,
    })

    // doc.text(
    //   `${product.price} ${product.currency.symbols[language] || ''}`,
    //   padding,
    //   doc.y,
    //   { width: contentWidth, height: 50, ellipsis: true, lineBreak: false },
    // )

    const result = (product.productProperties || [])
      .map((property: any) => {
        let value = ''

        if (typeof property.value === 'number') {
          if (property.id === 'baad1168-e6bd-48e1-a610-0fd60ffcfc4d') {
            value = `${property.value} cm`
          }
          else {
            value = `${property.value} g`
          }
        }
        else {
          value = property.optionData
            .map((option: any) => option.names[language])
            .join(', ')
        }

        return value
      })
      .join(', ')

    doc.text(result, padding, doc.y, {
      width: contentWidth,
      height: 50,
      ellipsis: true,
      lineBreak: false,
    })
  }

  return {
    status: 'success',
    code: 'BARCODE_PRINTED',
    message: 'Barcode printed',
    doc,
  }
}

const PROVIDER_E_SUFFIX_CATEGORY_ID = [
  '929dc694-afd4-406c-b766-00a1d483c68f',
  '96f2af3b-5c9c-45c0-9d86-642ec7d87113',
  'b043e8ac-e6a2-4109-9c11-989e010d6064',
  'bb3f3e6b-2aa7-4c32-8b18-df0d020c2e8e',
  '6cce41d5-3269-4683-9403-6ccd35e3b5ce',
  '9710cd12-bf66-4ad2-97e2-58546f24812c',
  '389f3c3e-517d-44b6-b182-5d1f3a788b58',
  'ad066db8-bfa8-428f-8e26-4e7069dce606',
]

function getProductCategoryId(cat: any): string | undefined {
  if (cat == null) {
    return undefined
  }
  if (typeof cat === 'string') {
    return cat
  }
  const id = cat.id ?? cat._id
  return id != null ? String(id) : undefined
}

function getProviderBarcodeSuffix(
  categories: any[] | undefined,
  providerPrice: Record<string, number>,
): { price: number, suffix: string } {
  const providerCategory = categories?.find((cat: any) => {
    const id = getProductCategoryId(cat)
    return id != null && providerPrice[id as keyof typeof providerPrice] != null
  })
  const categoryId = providerCategory
    ? getProductCategoryId(providerCategory)
    : undefined
  const price = categoryId
    ? providerPrice[categoryId as keyof typeof providerPrice] ?? 1000
    : 1000
  const suffix = PROVIDER_E_SUFFIX_CATEGORY_ID.includes(categoryId?.toString() || '') ? '-e' : ''
  return { price, suffix }
}

async function print55x40(payload: {
  barcodes: any[]
  size: string
  language: string
}): Promise<BarcodeTypes.printBarcodeResult> {
  const { propertyIds, hairTypes, providerPrice, propertyGroups }
    = getHardcodeData()

  const isDyed = payload.barcodes.some(
    (barcode: any) =>
      barcode.products[0]?.productPropertiesGroup?.id?.toString()
      === propertyGroups.dyed,
  )
  // const isDyed = true
  //  REPLACED

  if (isDyed)
    return await print55x40Dyed(payload)

  const { barcodes, size, language } = payload
  const [w, h] = size.split('x').map(Number)
  const padding = 10
  const contentWidth = w * 8.49 - padding * 2
  const contentHeight = h * 8.49 - padding * 2

  const doc = new PDFDocument({ autoFirstPage: false })

  doc.registerFont(
    'Manrope',
    path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'),
  )
  doc.registerFont(
    'Manrope-Bold',
    path.resolve(__dirname, '../utils/fonts/Manrope-Bold.ttf'),
  )

  for (const barcode of barcodes) {
    const product = barcode?.products?.[0]
    if (!product) {
      continue
    }

    const { price: providerPriceValue, suffix: providerSuffixMark }
    = getProviderBarcodeSuffix(product?.categories, providerPrice)

    const barcodePng = await bwipjs.toBuffer({
      bcid: 'code128',
      text: barcode.code,
      scale: 8,
      height: 20,
      includetext: false,
      textxalign: 'center',
    })

    let length = ''
    let weight = ''
    const type = [] as string[]

    for (const property of product.productProperties || []) {
      if (
        typeof property.value === 'number'
        && property.id === propertyIds.LENGTH
      ) {
        length = `${property.value} cm`
      }
      else if (
        typeof property.value === 'number'
        && property.id === propertyIds.WEIGHT
      ) {
        weight = `${property.value} g`
      }
      if (
        property.id === propertyIds.HAIR_TYPE
        && (property?.value || []).includes(hairTypes.VIRGIN)
      ) {
        type.push('Virgin')
      }
      if (
        property.id === propertyIds.HAIR_TYPE
        && (property?.value || []).includes(hairTypes.SILKY)
      ) {
        type.push('Silky')
      }
      if (
        property.id === propertyIds.HAIR_TYPE
        && (property?.value || []).includes(hairTypes.BROWN)
      ) {
        type.push('Brown')
      }
      if (
        property.id === propertyIds.HAIR_TYPE
        && (property?.value || []).includes(hairTypes.GRAY)
      ) {
        type.push('Gray')
      }
      if (
        property.id === propertyIds.HAIR_TYPE
        && (property?.value || []).includes(hairTypes.SLAVIC)
      ) {
        type.push('Slavic')
      }
      if (
        property.id === propertyIds.HAIR_TYPE
        && (property?.value || []).includes(hairTypes.ALBINO)
      ) {
        type.push('Albino')
      }
      if (
        property.id === propertyIds.HAIR_TYPE
        && (property?.value || []).includes(hairTypes.RED)
      ) {
        type.push('Red')
      }
      if (
        property.id === propertyIds.HAIR_TYPE
        && (property?.value || []).includes(hairTypes.CURLY)
      ) {
        type.push('Curly')
      }
    }

    const bigCode
  = ((product.names?.[language] || '').split('#')[1] || '0000').trim()

    const lenWgt = [length, weight].filter(Boolean).join(', ')

    function frontPage() {
      doc.addPage({
        size: [w * 8.49, h * 8.49],
        margins: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
      })

      doc.font('Manrope-Bold')

      const pageWidth = doc.page.width
      const pageHeight = doc.page.height
      const inset = 4
      const characterSpacing = -15
      const maxWidth = pageWidth - inset * 2
      const maxHeight = pageHeight - inset * 2

      let fontSize = Math.floor(maxHeight)

      while (fontSize > 10) {
        doc.fontSize(fontSize)

        const textWidth = doc.widthOfString(bigCode, {
          characterSpacing,
        })
        const textHeight = doc.currentLineHeight()

        if (textWidth <= maxWidth && textHeight <= maxHeight)
          break

        fontSize -= 1
      }

      const textWidth = doc.widthOfString(bigCode, {
        characterSpacing,
      })
      const x = (pageWidth - textWidth) / 2
      const y = doc.y + 105

      doc.text(bigCode, x, y, {
        lineBreak: false,
        height: 20,
        characterSpacing,
        baseline: 'middle',
      })

      doc.font('Manrope-Bold').fontSize(70)

      doc.text(lenWgt, padding, doc.y + 80, {
        width: contentWidth,
        height: 50,
        ellipsis: true,
        lineBreak: false,
        align: 'center',
      })

      doc.fontSize(56)
      doc.text(type.join(', '), padding, doc.y - 30, {
        width: contentWidth,
        height: 50,
        ellipsis: true,
        lineBreak: false,
        align: 'center',
      })
    }

    function backPage() {
      doc.addPage({
        size: [w * 8.49, h * 8.49],
        margins: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
      })

      doc.image(barcodePng, padding, padding, {
        width: contentWidth,
        height: contentHeight / 5,
      })

      doc.fontSize(16).text(
        `${barcode.code}${providerPriceValue ? `-${providerPriceValue + 5000}${providerSuffixMark}` : ''}`,
        padding,
        contentHeight / 5 + 13,
        {
          width: contentWidth,
          height: 25,
          align: 'center',
          ellipsis: true,
          lineBreak: false,
        },
      )

      doc.font('Manrope-Bold')

      const pageWidth = doc.page.width
      const pageHeight = doc.page.height
      const inset = 4
      const characterSpacing = -15
      const maxWidth = pageWidth - inset * 2
      const maxHeight = pageHeight - inset * 2

      let fontSize = Math.floor(maxHeight)

      while (fontSize > 10) {
        doc.fontSize(fontSize)

        const textWidth = doc.widthOfString(bigCode, {
          characterSpacing,
        })
        const textHeight = doc.currentLineHeight()

        if (textWidth <= maxWidth && textHeight <= maxHeight)
          break

        fontSize -= 1
      }

      const textWidth = doc.widthOfString(bigCode, {
        characterSpacing,
      })
      const x = (pageWidth - textWidth) / 2
      const y = doc.y + 75

      doc.text(bigCode, x, y, {
        lineBreak: false,
        height: 20,
        characterSpacing,
        baseline: 'middle',
      })

      doc.font('Manrope-Bold').fontSize(45)

      doc.text(lenWgt, padding, doc.y + 80, {
        width: contentWidth,
        height: 50,
        ellipsis: true,
        lineBreak: false,
        align: 'center',
      })

      doc.text(type.join(', '), padding, doc.y - 25, {
        width: contentWidth,
        height: 50,
        ellipsis: true,
        lineBreak: false,
        align: 'center',
      })
    }

    backPage()
    frontPage()

    // doc.image(barcodePng, padding, padding, {
    //   width: contentWidth,
    //   height: contentHeight / 4,
    // })

    // doc.text(
    //   `${barcode.code}${providerPriceValue ? `-${providerPriceValue + 5000}${providerSuffixMark}` : ''}`,
    //   padding,
    //   contentHeight / 4 + 7,
    //   {
    //     width: contentWidth,
    //     height: 25,
    //     align: 'center',
    //     ellipsis: true,
    //     lineBreak: false,
    //   },
    // )

    // doc.fontSize(70)
    // doc.font('Manrope-Bold').fontSize(130)

    // doc.text(bigCode, padding, doc.y - 40, {
    //   width: contentWidth,
    //   height: 50,
    //   lineBreak: false,
    //   align: 'center',
    // })

    // doc.font('Manrope').fontSize(70)

    // doc.text(lenWgt, padding, doc.y - 55, {
    //   width: contentWidth,
    //   height: 50,
    //   ellipsis: true,
    //   lineBreak: false,
    //   align: 'center',
    // })

    // doc.fontSize(56)
    // doc.text(type.join(', '), padding, doc.y - 30, {
    //   width: contentWidth,
    //   height: 50,
    //   ellipsis: true,
    //   lineBreak: false,
    //   align: 'center',
    // })

    // doc.addPage({ size: [w * 8.49, h * 8.49] })

    // doc.image(barcodePng, padding, padding, {
    //   width: contentWidth,
    //   height: contentHeight / 4,
    // })

    // doc.fontSize(20)

    // doc.text(
    //   `${barcode.code}${providerPriceValue ? `-${providerPriceValue + 5000}${providerSuffixMark}` : ''}`,
    //   padding,
    //   contentHeight / 4 + 7,
    //   {
    //     width: contentWidth,
    //     height: 25,
    //     align: 'center',
    //     ellipsis: true,
    //     lineBreak: false,
    //   },
    // )

    // doc.font('Manrope-Bold').fontSize(130)

    // doc.text(bigCode, padding, doc.y - 40, {
    //   width: contentWidth,
    //   height: 50,
    //   lineBreak: false,
    //   align: 'center',
    // })

    // doc.font('Manrope').fontSize(70)

    // doc.text(lenWgt, padding, doc.y - 55, {
    //   width: contentWidth,
    //   height: 50,
    //   ellipsis: true,
    //   lineBreak: false,
    //   align: 'center',
    // })

    // doc.fontSize(56)
    // doc.text(type.join(', '), padding, doc.y - 30, {
    //   width: contentWidth,
    //   height: 50,
    //   ellipsis: true,
    //   lineBreak: false,
    //   align: 'center',
    // })
    // doc.font('Manrope-Bold').fontSize(168)

    // const bigCodeHeight = doc.y

    // doc.text(bigCode, padding, bigCodeHeight - 30, {
    //   width: contentWidth,
    //   height: 50,
    //   lineBreak: false,
    //   align: 'center',
    // })

    // if (symbol) {
    //   doc.font('Manrope-Bold').fontSize(50)
    //   doc.text(symbol, padding + 20, doc.y - 20, {
    //     width: contentWidth,
    //     height: 50,
    //     lineBreak: false,
    //     align: 'left',
    //   })
    // }
  }

  return {
    status: 'success',
    code: 'BARCODE_PRINTED',
    message: 'Barcodes printed',
    doc,
  }
}

async function print55x40Dyed(payload: {
  barcodes: any[]
  size: string
  language: string
}): Promise<BarcodeTypes.printBarcodeResult> {
  const { barcodes } = payload
  const language = 'en'
  // const [w, h] = size.split('x').map(Number)
  const w = 58
  const h = 81
  const padding = 10
  const contentWidth = w * 8.49 - padding * 2
  const contentHeight = h * 8.49 - padding * 2

  const doc = new PDFDocument({ autoFirstPage: false })

  const { propertyIds, hairTypes, providerPrice, symbol, colorCategories }
    = getHardcodeData()

  doc.registerFont(
    'Manrope',
    path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'),
  )
  doc.registerFont(
    'Manrope-Bold',
    path.resolve(__dirname, '../utils/fonts/Manrope-Bold.ttf'),
  )

  for (const barcode of barcodes) {
    const product = barcode?.products?.[0]
    if (!product) {
      continue
    }

    doc.font('Manrope')
    doc.fontSize(25)
    doc.addPage({ size: [w * 8.49, h * 8.49] })

    let length = ''
    let weight = ''
    let segment = 'Standard'
    const type: string[] = []
    let colorCategory: string = ''
    // REPLACED

    for (const property of product.productProperties || []) {
      if (
        typeof property.value === 'number'
        && property.id === propertyIds.LENGTH
      ) {
        length = `${property.value} cm`
      }
      else if (
        typeof property.value === 'number'
        && property.id === propertyIds.WEIGHT
      ) {
        weight = `${property.value} g`
      }
      if (property.id === propertyIds.SEGMENT) {
        segment = property.optionData
          .map((option: any) => option.names[language])
          .join(', ')
      }
      if (
        property.id === propertyIds.COLOR_CATEGORY
        && property.value === colorCategories.NATURAL_COLOR
      ) {
        colorCategory = 'Natural Color'
      }
      if (
        property.id === propertyIds.COLOR_CATEGORY
        && property.value === colorCategories.BALAYAGE
      ) {
        colorCategory = 'Balayage'
      }
      if (
        property.id === propertyIds.COLOR_CATEGORY
        && property.value === colorCategories.OMBRE
      ) {
        colorCategory = 'Ombre'
      }
      if (
        property.id === propertyIds.COLOR_CATEGORY
        && property.value === colorCategories.PLATIN
      ) {
        colorCategory = 'Platin'
      }
      if (
        property.id === propertyIds.COLOR_CATEGORY
        && property.value === colorCategories.BLONDE
      ) {
        colorCategory = 'Blonde'
      }
      if (
        property.id === propertyIds.HAIR_TYPE
        && (property?.value || []).includes(hairTypes.VIRGIN)
      ) {
        type.push('Virgin')
      }
      if (
        property.id === propertyIds.HAIR_TYPE
        && (property?.value || []).includes(hairTypes.SILKY)
      ) {
        type.push('Silky')
      }
      if (
        property.id === propertyIds.HAIR_TYPE
        && (property?.value || []).includes(hairTypes.BROWN)
      ) {
        type.push('Brown')
      }
      if (
        property.id === propertyIds.HAIR_TYPE
        && (property?.value || []).includes(hairTypes.GRAY)
      ) {
        type.push('Gray')
      }
      if (
        property.id === propertyIds.HAIR_TYPE
        && (property?.value || []).includes(hairTypes.SLAVIC)
      ) {
        type.push('Slavic')
      }
      if (
        property.id === propertyIds.HAIR_TYPE
        && (property?.value || []).includes(hairTypes.ALBINO)
      ) {
        type.push('Albino')
      }
      if (
        property.id === propertyIds.HAIR_TYPE
        && (property?.value || []).includes(hairTypes.RED)
      ) {
        type.push('Red')
      }
      if (
        property.id === propertyIds.HAIR_TYPE
        && (property?.value || []).includes(hairTypes.CURLY)
      ) {
        type.push('Curly')
      }
    }

    const lenWgt = [length || '000cm', weight || '000g']
      .filter(Boolean)
      .join(', ')

    async function backside() {
      doc.addPage({ size: [w * 8.49, h * 8.49] })
      doc.font('Manrope').fontSize(25)

      const barcodePng = await bwipjs.toBuffer({
        bcid: 'code128',
        text: barcode.code,
        scale: 8,
        height: 20,
        includetext: false,
        textxalign: 'center',
      })

      doc.image(barcodePng, padding, padding, {
        width: contentWidth,
        height: contentHeight / 4,
      })

      const { price: providerPriceValue, suffix: providerSuffixMark }
        = getProviderBarcodeSuffix(product?.categories, providerPrice)

      doc.text(
        `${barcode.code}${providerPriceValue ? `-${providerPriceValue + 5000}${providerSuffixMark}` : ''}`,
        padding,
        contentHeight / 4 + 10,
        {
          width: contentWidth,
          height: 25,
          align: 'center',
          ellipsis: true,
          lineBreak: false,
        },
      )

      doc.font('Manrope-Bold').fontSize(72)

      doc.text(lenWgt, padding, doc.y, {
        width: contentWidth,
        height: 50,
        ellipsis: false,
        lineBreak: false,
        align: 'center',
      })

      doc.font('Manrope-Bold').fontSize(72)
      // doc.text(
      //   type.join(', '),
      //   padding,
      //   doc.y,
      //   { width: contentWidth, height: 50, ellipsis: true, lineBreak: false, align: 'center' },
      // )

      doc.text(segment, padding, doc.y + 20, {
        width: contentWidth,
        height: 50,
        ellipsis: true,
        lineBreak: false,
        align: 'center',
      })

      doc.text(colorCategory, padding, doc.y + 20, {
        width: contentWidth,
        height: 50,
        ellipsis: true,
        lineBreak: false,
        align: 'center',
      })
    }

    async function frontside() {
      doc.font('Manrope-Bold').fontSize(68)

      const bigCode
        = (product.names?.[language] || '').split('#')[1] || '00000'

      const bigCodeHeight = doc.y

      doc.font('Manrope-Bold').fontSize(82)

      doc.text(segment, padding, doc.y - 90, {
        width: contentWidth,
        height: 50,
        lineBreak: false,
        align: 'center',
      })

      doc.font('Manrope-Bold').fontSize(72)
      doc.text(colorCategory, padding, doc.y - 35, {
        width: contentWidth,
        height: 50,
        ellipsis: true,
        lineBreak: false,
        align: 'center',
      })

      doc.font('Manrope-Bold').fontSize(142)

      doc.text(bigCode, padding, bigCodeHeight + 40, {
        width: contentWidth,
        height: 50,
        lineBreak: false,
        align: 'center',
      })

      doc.font('Manrope-Bold').fontSize(72)
      doc.text(lenWgt, padding, doc.y - 50, {
        width: contentWidth,
        height: 50,
        ellipsis: false,
        lineBreak: false,
        align: 'center',
      })

      if (symbol) {
        doc.font('Manrope-Bold').fontSize(50)
        doc.text(symbol, padding + 20, doc.y - 20, {
          width: contentWidth,
          height: 50,
          lineBreak: false,
          align: 'left',
        })
      }

      // const info = ['Structure: Porous', 'Combing: 25cm', 'Processing: Lighted, Tonneded', 'Color: DB3']
      const info = []
      // REPLACED

      for (const property of product.productProperties || []) {
        if (property.id === propertyIds.STRUCTURE) {
          info.push(
            `Structure: ${property.optionData.map((option: any) => option.names[language]).join(', ')}`,
          )
        }
        if (property.id === propertyIds.COMBING) {
          info.push(
            `Combing: ${property.optionData.map((option: any) => option.names[language]).join(', ')}`,
          )
        }
        if (property.id === propertyIds.PROCCESSING_TYPE) {
          info.push(
            `Processing: ${property.optionData.map((option: any) => option.names[language]).join(', ')}`,
          )
        }
        if (property.id === propertyIds.COLOR) {
          info.push(
            `Color: ${property.optionData.map((option: any) => option.names[language]).join(', ')}`,
          )
        }
      }

      doc.font('Manrope-Bold').fontSize(46)
      for (const item of info) {
        doc.text(item, padding, doc.y, {
          width: contentWidth - 25,
          height: 200,
          ellipsis: true,
          lineBreak: true,
          align: 'left',
        })
      }
    }

    await frontside()
    await backside()

    // doc.addPage({ size: [w * 8.49, h * 8.49] })
    // doc.line(padding, doc.y - 30, contentWidth, doc.y - 30, { color: '#000', width: 1 })
  }

  return {
    status: 'success',
    code: 'BARCODE_PRINTED',
    message: 'Barcodes printed',
    doc,
  }
}
