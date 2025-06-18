import type * as BarcodeTypes from '../types/barcode.type'

import path from 'node:path'
import bwipjs from 'bwip-js'
import PDFDocument from 'pdfkit'
import { STORAGE_URLS } from '../config/constants'
import { BarcodeModel, CounterModel } from '../models/'
import { ProductModel } from '../models/product.model'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: BarcodeTypes.getBarcodesParams): Promise<BarcodeTypes.getBarcodesResult> {
  const { current = 1, pageSize = 10 } = payload.pagination

  const {
    id = '',
    code = '',
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
  } = payload.filters

  const filterRules = {
    _id: { type: 'string' },
    code: { type: 'string' },
    products: { type: 'array' },
    active: { type: 'array' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { _id: id, code, products, active, createdAt, updatedAt },
    rules: filterRules,
  })

  const sorters = buildSortQuery(payload.sorters)

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
    { $addFields: { 'product.currency': { $arrayElemAt: ['$product.currency', 0] } } },

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

  return { status: 'success', code: 'BARCODES_REMOVED', message: 'Barcodes removed' }
}

export async function print(payload: BarcodeTypes.printBarcodeParams): Promise<BarcodeTypes.printBarcodeResult> {
  const { id, size = '20x30', language = 'en' } = payload

  const { barcodes } = await get({ filters: { id }, pagination: { full: true }, sorters: {} })
  const barcode = barcodes[0]

  if (!barcode) {
    throw new HttpError(400, 'Barcode not found', 'BARCODE_NOT_FOUND')
  }

  if (size === '60x30') {
    return await print60x30({ barcode, size, language })
  }

  const [w, h] = size.split('x').map(Number)
  const padding = 10
  const contentWidth = w * 8.49 - padding * 2
  const contentHeight = h * 8.49 - padding * 2

  const doc = new PDFDocument({ autoFirstPage: false })

  doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
  doc.font('Manrope')
  doc.fontSize(18)
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
    contentHeight / 2 + 15,
    { width: contentWidth, height: 25, align: 'center', ellipsis: true, lineBreak: false },
  )

  const productsText = barcode.products.map((product: any) => product.names[language] || '').join(', ')

  doc.text(
    productsText,
    padding,
    doc.y,
    { width: contentWidth, height: 50, ellipsis: true, lineBreak: false },
  )

  return { status: 'success', code: 'BARCODE_PRINTED', message: 'Barcode printed', doc }
}

async function print60x30(payload: { barcode: any, size: string, language: string }): Promise<BarcodeTypes.printBarcodeResult> {
  const { barcode, size, language } = payload
  const [w, h] = size.split('x').map(Number)
  const padding = 10
  const contentWidth = w * 8.49 - padding * 2
  const contentHeight = h * 8.49 - padding * 2

  const product = barcode.products[0]

  const doc = new PDFDocument({ autoFirstPage: false })

  doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
  doc.font('Manrope')
  doc.fontSize(20)
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

  doc.text(
    `${product.price} ${product.currency.symbols[language] || ''}`,
    padding,
    doc.y,
    { width: contentWidth, height: 50, ellipsis: true, lineBreak: false },
  )

  const brand = product.productProperties.find((property: any) => property.id === '5fac5ba7-df3f-4eef-8e80-26f6aac48588')

  const color = product.productProperties.find((property: any) => property.id === '0481d1f8-3364-4258-83e2-5c240e026ae4')

  doc.text(
    `${brand.optionData.map((option: any) => option.names[language]).join(', ')}, ${color.optionData.map((option: any) => option.names[language]).join(', ')}`,
    padding,
    doc.y,
    { width: contentWidth, height: 50, ellipsis: true, lineBreak: false },
  )

  return { status: 'success', code: 'BARCODE_PRINTED', message: 'Barcode printed', doc }
}
