import type * as BarcodeTypes from '../types/barcode.type'

import path from 'node:path'
import bwipjs from 'bwip-js'
import PDFDocument from 'pdfkit'
import { STORAGE_URLS } from '../config/constants'
import { dropDB } from '../config/db'
import { BarcodeModel, CounterModel } from '../models/'
import { ProductModel } from '../models/product.model'
import { HttpError } from '../utils/httpError'
import { getHardcodeData } from '../utils/mongodb/hardcode'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'
import * as AuditLogsService from './audit-logs.service'

export async function get(payload: BarcodeTypes.getBarcodesParams): Promise<BarcodeTypes.getBarcodesResult> {
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
    { $unwind: { path: '$product.productProperties', preserveNullAndEmptyArrays: true } },
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
    { $addFields: { 'product.purchaseCurrency': { $arrayElemAt: ['$product.purchaseCurrency', 0] } } },
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
    { $addFields: { 'product.productPropertiesGroup': { $arrayElemAt: ['$product.productPropertiesGroup', 0] } } },
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
        barcodes: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
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
    return { status: 'success', code: 'BARCODES_FETCHED_EMPTY', message: 'Zero barcodes fetched', barcodes, barcodesCount }
  }

  return { status: 'success', code: 'BARCODES_FETCHED', message: 'Barcodes fetched', barcodes, barcodesCount }
}

export async function create(payload: BarcodeTypes.createBarcodeParams): Promise<BarcodeTypes.createBarcodeResult> {
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

  await ProductModel.updateMany({ _id: { $in: parsedProducts.map(product => product._id) } }, { $push: { barcodes: barcode._id } })

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

  return { status: 'success', code: 'BARCODE_CREATED', message: 'Barcode created', barcode }
}

export async function generateCode(): Promise<BarcodeTypes.generateCodeResult> {
  const counter = await CounterModel.findOne({ _id: 'barcodes' }) || { seq: 0 }
  const seq = counter.seq + 1

  const code = `224${seq.toString().padStart(10, '0')}`

  return { status: 'success', code: 'BARCODE_CODE_GENERATED', message: 'Barcode code generated', barcode: code }
}

export async function edit(payload: BarcodeTypes.editBarcodeParams): Promise<BarcodeTypes.editBarcodeResult> {
  const { id, code, products, active } = payload

  const parsedProducts = products.map((product: any) => ({
    _id: product.id,
    quantity: product.quantity,
  }))

  await ProductModel.updateMany({ barcodes: { $in: [id] } }, { $pull: { barcodes: { $in: [id] } } })

  const barcode = await BarcodeModel.findOneAndUpdate({ _id: id }, { code, products: parsedProducts, active })

  await ProductModel.updateMany({ _id: { $in: parsedProducts.map(product => product._id) } }, { $push: { barcodes: id } })

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

  return { status: 'success', code: 'BARCODE_EDITED', message: 'Barcode edited', barcode }
}

export async function remove(payload: BarcodeTypes.removeBarcodesParams): Promise<BarcodeTypes.removeBarcodesResult> {
  const { ids } = payload

  const barcodes = await BarcodeModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  await ProductModel.updateMany({ barcodes: { $in: ids } }, { $pull: { barcodes: { $in: ids } } })

  if (!barcodes) {
    throw new HttpError(400, 'Barcodes not removed', 'BARCODES_NOT_REMOVED')
  }

  for (const id of ids) {
    const barcode = await BarcodeModel.findOneAndUpdate({ _id: id }, { removed: true })

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

  return { status: 'success', code: 'BARCODES_REMOVED', message: 'Barcodes removed' }
}

export async function print(payload: BarcodeTypes.printBarcodeParams): Promise<BarcodeTypes.printBarcodeResult> {
  const { ids, codes, size = '20x30', language = 'en' } = payload

  const { barcodes } = await get({ filters: { ids, codes }, pagination: { full: true }, sorters: {} })

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

async function print60x30(payload: { barcodes: any[], size: string, language: string }): Promise<BarcodeTypes.printBarcodeResult> {
  const { barcodes, size, language } = payload
  const [w, h] = size.split('x').map(Number)
  const padding = 10
  const contentWidth = w * 8.49 - padding * 2
  const contentHeight = h * 8.49 - padding * 2

  const doc = new PDFDocument({ autoFirstPage: false })

  doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
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

    doc.image(
      barcodePng,
      padding,
      padding,
      { width: contentWidth, height: contentHeight / 2 },
    )

    doc.text(
      barcode.code,
      padding,
      contentHeight / 2 + 10,
      { width: contentWidth, height: 25, align: 'center', ellipsis: true, lineBreak: false },
    )

    doc.text(
      product.names[language],
      padding,
      doc.y,
      { width: contentWidth, height: 50, ellipsis: true, lineBreak: false },
    )

    // doc.text(
    //   `${product.price} ${product.currency.symbols[language] || ''}`,
    //   padding,
    //   doc.y,
    //   { width: contentWidth, height: 50, ellipsis: true, lineBreak: false },
    // )

    const result = (product.productProperties || []).map((property: any) => {
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
        value = property.optionData.map((option: any) => option.names[language]).join(', ')
      }

      return value
    }).join(', ')

    doc.text(
      result,
      padding,
      doc.y,
      { width: contentWidth, height: 50, ellipsis: true, lineBreak: false },
    )
  }

  return { status: 'success', code: 'BARCODE_PRINTED', message: 'Barcode printed', doc }
}

async function print55x40(payload: { barcodes: any[], size: string, language: string }): Promise<BarcodeTypes.printBarcodeResult> {
  const { propertyIds, hairTypes, providerPrice, symbol, propertyGroups } = getHardcodeData()

  const isDyed = payload.barcodes.some((barcode: any) => barcode.products[0].productPropertiesGroup.id.toString() === propertyGroups.dyed)
  // const isDyed = true

  if (isDyed)
    return await print55x40Dyed(payload)

  const { barcodes, size, language } = payload
  const [w, h] = size.split('x').map(Number)
  const padding = 10
  const contentWidth = w * 8.49 - padding * 2
  const contentHeight = h * 8.49 - padding * 2

  const doc = new PDFDocument({ autoFirstPage: false })

  doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
  doc.registerFont('Manrope-Bold', path.resolve(__dirname, '../utils/fonts/Manrope-Bold.ttf'))

  for (const barcode of barcodes) {
    const product = barcode?.products?.[0]
    if (!product) {
      continue
    }

    doc.font('Manrope')
    doc.fontSize(25)
    doc.addPage({ size: [w * 8.49, h * 8.49] })

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

    const providerSuffix = product?.categories
      ?.map((cat: any) => providerPrice[cat.id as keyof typeof providerPrice])
      ?.filter(Boolean)
      .join('') || ''

    doc.text(
      `${barcode.code}${providerSuffix ? `-${Number(providerSuffix) + 5000}` : ''}`,
      padding,
      contentHeight / 2 + 10,
      { width: contentWidth, height: 25, align: 'center', ellipsis: true, lineBreak: false },
    )

    doc.fontSize(70)

    let length = ''
    let weight = ''
    const type = []

    for (const property of product.productProperties || []) {
      if (typeof property.value === 'number' && property.id === propertyIds.LENGTH) {
        length = `${property.value} cm`
      }
      else if (typeof property.value === 'number' && property.id === propertyIds.WEIGHT) {
        weight = `${property.value} g`
      }
      if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.VIRGIN)) {
        type.push('Virgin')
      }
      if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.SILKY)) {
        type.push('Silky')
      }
      if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.BROWN)) {
        type.push('Brown')
      }
      if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.GRAY)) {
        type.push('Gray')
      }
      if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.SLAVIC)) {
        type.push('Slavic')
      }
      if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.ALBINO)) {
        type.push('Albino')
      }
      if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.RED)) {
        type.push('Red')
      }
      if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.CURLY)) {
        type.push('Curly')
      }
    }

    const lenWgt = [length, weight].filter(Boolean).join(', ')
    doc.text(
      lenWgt,
      padding,
      doc.y - 10,
      { width: contentWidth, height: 50, ellipsis: true, lineBreak: false, align: 'center' },
    )

    doc.fontSize(56)
    doc.text(
      type.join(', '),
      padding,
      doc.y - 25,
      { width: contentWidth, height: 50, ellipsis: true, lineBreak: false, align: 'center' },
    )

    doc.addPage({ size: [w * 8.49, h * 8.49] })
    doc.font('Manrope-Bold').fontSize(170)

    const bigCode = (product.names?.[language] || '').split('#')[1] || 'ERROR'

    const bigCodeHeight = doc.y

    doc.text(
      bigCode,
      padding,
      bigCodeHeight - 30,
      { width: contentWidth, height: 50, lineBreak: false, align: 'center' },
    )

    if (symbol) {
      doc.font('Manrope-Bold').fontSize(50)
      doc.text(
        symbol,
        padding + 20,
        doc.y - 20,
        { width: contentWidth, height: 50, lineBreak: false, align: 'left' },
      )
    }
  }

  return { status: 'success', code: 'BARCODE_PRINTED', message: 'Barcodes printed', doc }
}

async function print55x40Dyed(payload: { barcodes: any[], size: string, language: string }): Promise<BarcodeTypes.printBarcodeResult> {
  const { barcodes, size } = payload
  const language = 'en'
  // const [w, h] = size.split('x').map(Number)
  const w = 58
  const h = 81
  const padding = 10
  const contentWidth = w * 8.49 - padding * 2
  const contentHeight = h * 8.49 - padding * 2

  const doc = new PDFDocument({ autoFirstPage: false })

  const { propertyIds, hairTypes, providerPrice, symbol, colorCategories } = getHardcodeData()

  doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
  doc.registerFont('Manrope-Bold', path.resolve(__dirname, '../utils/fonts/Manrope-Bold.ttf'))

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
    let segment = 'Standart'
    const type: string[] = []
    let colorCategory: string = ''

    for (const property of product.productProperties || []) {
      if (typeof property.value === 'number' && property.id === propertyIds.LENGTH) {
        length = `${property.value} cm`
      }
      else if (typeof property.value === 'number' && property.id === propertyIds.WEIGHT) {
        weight = `${property.value} g`
      }
      if (property.id === propertyIds.SEGMENT) {
        segment = property.optionData.map((option: any) => option.names[language]).join(', ')
      }
      if (property.id === propertyIds.COLOR_CATEGORY) {
        colorCategory = property.optionData.find((option: any) => option.id === colorCategories[colorCategory as keyof typeof colorCategories])?.names[language] || 'Natural Color'
      }
      if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.VIRGIN)) {
        type.push('Virgin')
      }
      if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.SILKY)) {
        type.push('Silky')
      }
      if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.BROWN)) {
        type.push('Brown')
      }
      if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.GRAY)) {
        type.push('Gray')
      }
      if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.SLAVIC)) {
        type.push('Slavic')
      }
      if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.ALBINO)) {
        type.push('Albino')
      }
      if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.RED)) {
        type.push('Red')
      }
      if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.CURLY)) {
        type.push('Curly')
      }
      if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.REMY)) {
        type.push('Remy')
      }
    }

    const lenWgt = [length || '000cm', weight || '000g'].filter(Boolean).join(', ')

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

      const providerSuffix = product?.categories
        ?.map((cat: any) => providerPrice[cat.id as keyof typeof providerPrice])
        ?.filter(Boolean)
        .join('') || '1000'

      doc.text(
        `${barcode.code}${providerSuffix ? `-${Number(providerSuffix) + 5000}` : ''}`,
        padding,
        contentHeight / 4 + 10,
        { width: contentWidth, height: 25, align: 'center', ellipsis: true, lineBreak: false },
      )

      doc.font('Manrope-Bold').fontSize(65)

      doc.text(
        lenWgt,
        padding,
        doc.y,
        { width: contentWidth, height: 50, ellipsis: true, lineBreak: false, align: 'center' },
      )

      doc.font('Manrope-Bold').fontSize(64)
      doc.text(
        type.join(', '),
        padding,
        doc.y,
        { width: contentWidth, height: 50, ellipsis: true, lineBreak: false, align: 'center' },
      )

      doc.text(
        colorCategory,
        padding,
        doc.y + 120,
        { width: contentWidth, height: 50, ellipsis: true, lineBreak: false, align: 'center' },
      )
    }

    async function frontside() {
      doc.font('Manrope-Bold').fontSize(68)

      const bigCode = (product.names?.[language] || '').split('#')[1] || '00000'

      const bigCodeHeight = doc.y

      doc.font('Manrope-Bold').fontSize(68)

      doc.text(
        segment,
        padding,
        doc.y - 70,
        { width: contentWidth, height: 50, lineBreak: false, align: 'center' },
      )

      doc.font('Manrope-Bold').fontSize(132)

      doc.text(
        bigCode,
        padding,
        bigCodeHeight - 15,
        { width: contentWidth, height: 50, lineBreak: false, align: 'center' },
      )

      doc.font('Manrope-Bold').fontSize(68)
      doc.text(
        lenWgt,
        padding,
        doc.y - 40,
        { width: contentWidth, height: 50, ellipsis: true, lineBreak: false, align: 'center' },
      )

      if (symbol) {
        doc.font('Manrope-Bold').fontSize(50)
        doc.text(
          symbol,
          padding + 20,
          doc.y - 20,
          { width: contentWidth, height: 50, lineBreak: false, align: 'left' },
        )
      }

      // const info = ['Structure: Porous', 'Combing: 25cm', 'Processing: Lighted', 'Type: Slavic, Curly', 'Color: DB3']
      const info = []

      for (const property of product.productProperties || []) {
        if (property.id === propertyIds.STRUCTURE) {
          info.push(`Structure: ${property.optionData.map((option: any) => option.names[language]).join(', ')}`)
        }
        if (property.id === propertyIds.COMBING) {
          info.push(`Combing: ${property.optionData.map((option: any) => option.names[language]).join(', ')}`)
        }
        if (property.id === propertyIds.PROCCESSING_TYPE) {
          info.push(`Processing: ${property.optionData.map((option: any) => option.names[language]).join(', ')}`)
        }
        if (property.id === propertyIds.HAIR_TYPE) {
          info.push(`Type: ${property.optionData.map((option: any) => option.names[language]).join(', ')}`)
        }
        if (property.id === propertyIds.COLOR) {
          info.push(`Color: ${property.optionData.map((option: any) => option.names[language]).join(', ')}`)
        }
      }

      // info.push('Structure: Porous', 'Combing: 25cm', 'Processing: Lighted', 'Type: Slavic, Curly', 'Color: DB3')
      doc.font('Manrope-Bold').fontSize(42)
      doc.y = doc.y + 25
      for (const item of info) {
        doc.text(
          item,
          padding,
          doc.y,
          { width: contentWidth - 25, height: 200, ellipsis: true, lineBreak: true, align: 'left' },
        )
      }
    }

    await frontside()
    await backside()

    // doc.addPage({ size: [w * 8.49, h * 8.49] })
    // doc.line(padding, doc.y - 30, contentWidth, doc.y - 30, { color: '#000', width: 1 })
  }

  return { status: 'success', code: 'BARCODE_PRINTED', message: 'Barcodes printed', doc }
}
