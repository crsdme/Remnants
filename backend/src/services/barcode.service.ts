import type {
  AuthUser,
  BarcodeDTO,
  CreateBarcodeResponse,
  EditBarcodeResponse,
  GenerateCodeResponse,
  GetBarcodesResponse,
  PrintBarcodeResponse,
  RemoveBarcodesResponse,
} from '@remnant/shared'
import type {
  CreateBarcodesPayload,
  EditBarcodesPayload,
  GetBarcodesPayload,
  PrintBarcodePayload,
  RemoveBarcodesPayload,
} from '@/types'
import path from 'node:path'
import bwipjs from 'bwip-js'
import PDFDocument from 'pdfkit'
import { mapBarcodeToDTO } from '@/mappers/'
import { CounterModel } from '@/models/'
import * as barcodesRepo from '@/repositories/barcodes.repo'
import * as productsRepo from '@/repositories/products.repo'
import * as AuditLogsService from '@/services/audit-logs.service'
import { getHardcodeData, HttpError } from '@/utils/'

export type PdfKitDoc = InstanceType<typeof PDFDocument>

export async function get({ payload }: { payload: GetBarcodesPayload }): Promise<GetBarcodesResponse> {
  const { items, total, page, pageSize } = await barcodesRepo.list(payload)

  return {
    status: 'success',
    code: 'BARCODES_FETCHED',
    message: 'Barcodes fetched',
    data: {
      items,
      pagination: { total, page, pageSize },
    },
  }
}

export async function create({ payload }: { payload: CreateBarcodesPayload }): Promise<CreateBarcodeResponse> {
  let { code, products, active } = payload

  const parsedProducts = products.map(product => ({
    _id: product.id,
    quantity: product.quantity,
  }))

  if (code === undefined || code.length === 0) {
    const { data: barcode } = await generateCode()
    code = barcode
  }
  const barcode = await barcodesRepo.createOne({
    code,
    products: parsedProducts,
    active,
  })

  await productsRepo.addBarcodeToProducts(
    parsedProducts.map(product => product._id),
    barcode._id,
  )

  await AuditLogsService.create({
    resourceType: 'barcode',
    resourceId: barcode._id.toString(),
    action: 'create',
    changes: [
      { path: 'code', before: null, after: barcode.code },
      { path: 'products', before: null, after: products },
      { path: 'active', before: null, after: active },
    ],
  })

  return {
    status: 'success',
    code: 'BARCODE_CREATED',
    message: 'Barcode created',
    data: mapBarcodeToDTO(barcode),
  }
}

export async function generateCode(): Promise<GenerateCodeResponse> {
  const counter = await CounterModel.findOne({ _id: 'barcodes' }) || { seq: 0 }
  const seq = counter.seq + 1

  const code = `224${seq.toString().padStart(10, '0')}`

  return {
    status: 'success',
    code: 'BARCODE_CODE_GENERATED',
    message: 'Barcode code generated',
    data: code,
  }
}

export async function edit({ payload }: { payload: EditBarcodesPayload }): Promise<EditBarcodeResponse> {
  const { id, code, products, active } = payload

  const parsedProducts = products.map(product => ({
    _id: product.id,
    quantity: product.quantity,
  }))

  await productsRepo.removeBarcodeFromProducts(id)

  await productsRepo.addBarcodeToProducts(parsedProducts.map(product => product._id), id)

  const barcode = await barcodesRepo.updateById(id, { code, products: parsedProducts, active })

  if (!barcode) {
    throw new HttpError(400, 'Barcode not edited', 'BARCODE_NOT_EDITED')
  }

  await AuditLogsService.create({
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
    data: mapBarcodeToDTO(barcode),
  }
}

export async function remove({ payload }: { payload: RemoveBarcodesPayload }): Promise<RemoveBarcodesResponse> {
  for (const id of payload.ids) {
    const barcode = await barcodesRepo.removeById(id)

    await productsRepo.removeBarcodeFromProducts(id)

    if (!barcode)
      continue

    await AuditLogsService.create({
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

export async function print({ payload }: { payload: PrintBarcodePayload }): Promise<PrintBarcodeResponse<PdfKitDoc>> {
  const { ids, codes, size = '20x30', language = 'en' } = payload

  const { items: barcodes } = await barcodesRepo.list({
    filters: { ids, codes },
    pagination: { current: 1, pageSize: 1000, full: true },
  })

  if (barcodes.length === 0)
    throw new HttpError(400, 'Barcodes not found', 'BARCODES_NOT_FOUND')

  if (size === '60x30')
    return print60x30({ barcodes, size, language })

  if (size === '55x40')
    return print55x40({ barcodes, size, language })

  return print20x30({ barcodes, size, language })
}

async function print20x30(payload: { barcodes: BarcodeDTO[], size: string, language: string }): Promise<PrintBarcodeResponse<PdfKitDoc>> {
  const { barcodes, size, language } = payload
  const [w, h] = size.split('x').map(Number)
  const padding = 10
  const contentWidth = w * 8.49 - padding * 2
  const contentHeight = h * 8.49 - padding * 2

  const doc = new PDFDocument({ autoFirstPage: false })

  doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
  doc.font('Manrope')

  for (const barcode of barcodes) {
    doc.fontSize(18)
    doc.addPage({ size: [w * 8.49, h * 8.49] })

    const product = barcode.products[0]

    if (typeof product === 'undefined')
      throw new HttpError(400, 'Product not found', 'PRODUCT_NOT_FOUND')

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

    doc.text(
      product.names[language],
      padding,
      doc.y,
      { width: contentWidth, height: 50, ellipsis: true, lineBreak: false },
    )
  }

  return {
    status: 'success',
    code: 'BARCODE_PRINTED',
    message: 'Barcode printed',
    doc,
  }
}

async function print60x30(payload: { barcodes: BarcodeDTO[], size: string, language: string }): Promise<PrintBarcodeResponse<PdfKitDoc>> {
  const { barcodes, size, language } = payload
  const [w, h] = size.split('x').map(Number)
  const padding = 10
  const contentWidth = w * 8.49 - padding * 2
  const contentHeight = h * 8.49 - padding * 2

  const doc = new PDFDocument({ autoFirstPage: false })

  doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
  doc.font('Manrope')

  for (const barcode of barcodes) {
    const product = barcode.products[0]
    if (typeof product === 'undefined')
      continue
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
  }

  return {
    status: 'success',
    code: 'BARCODE_PRINTED',
    message: 'Barcode printed',
    doc,
  }
}

async function print55x40(payload: { barcodes: BarcodeDTO[], size: string, language: string }): Promise<PrintBarcodeResponse<PdfKitDoc>> {
  const { barcodes, size, language } = payload
  const [w, h] = size.split('x').map(Number)
  const padding = 10
  const contentWidth = w * 8.49 - padding * 2
  const contentHeight = h * 8.49 - padding * 2

  const doc = new PDFDocument({ autoFirstPage: false })

  const { propertyIds, hairTypes, providerPrice, symbol } = getHardcodeData()

  doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
  doc.registerFont('Manrope-Bold', path.resolve(__dirname, '../utils/fonts/Manrope-Bold.ttf'))

  for (const barcode of barcodes) {
    const product = barcode.products[0]
    if (typeof product === 'undefined')
      throw new HttpError(400, 'Product not found', 'PRODUCT_NOT_FOUND')

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

    const providerSuffix = product.categories
      ?.map(cat => providerPrice[cat.id as keyof typeof providerPrice])
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

    // for (const property of product.productProperties) {
    //   if (typeof property.value === 'number' && property.id === propertyIds.LENGTH) {
    //     length = `${property.value} cm`
    //   }
    //   else if (typeof property.value === 'number' && property.id === propertyIds.WEIGHT) {
    //     weight = `${property.value} g`
    //   }
    //   if (property.id === propertyIds.HAIR_TYPE && property.value.includes(hairTypes.VIRGIN)) {
    //     type.push('Virgin')
    //   }
    //   if (property.id === propertyIds.HAIR_TYPE && property.value.includes(hairTypes.SILKY)) {
    //     type.push('Silky')
    //   }
    //   if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.BROWN)) {
    //     type.push('Brown')
    //   }
    //   if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.GRAY)) {
    //     type.push('Gray')
    //   }
    //   if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.SLAVIC)) {
    //     type.push('Slavic')
    //   }
    //   if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.ALBINO)) {
    //     type.push('Albino')
    //   }
    //   if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.RED)) {
    //     type.push('Red')
    //   }
    //   if (property.id === propertyIds.HAIR_TYPE && (property?.value || []).includes(hairTypes.CURLY)) {
    //     type.push('Curly')
    //   }
    // }

    const HAIR_TYPE_LABELS: Record<string, string> = {
      [hairTypes.VIRGIN]: 'Virgin',
      [hairTypes.SILKY]: 'Silky',
      [hairTypes.BROWN]: 'Brown',
      [hairTypes.GRAY]: 'Gray',
      [hairTypes.SLAVIC]: 'Slavic',
      [hairTypes.ALBINO]: 'Albino',
      [hairTypes.RED]: 'Red',
      [hairTypes.CURLY]: 'Curly',
    }

    for (const prop of product.productProperties) {
      switch (prop.id) {
        case propertyIds.LENGTH:
          if (typeof prop.value === 'number')
            length = `${prop.value} cm`
          break

        case propertyIds.WEIGHT:
          if (typeof prop.value === 'number')
            weight = `${prop.value} g`
          break

        case propertyIds.HAIR_TYPE: {
          const values = Array.isArray(prop.value) ? prop.value.filter((x): x is string => typeof x === 'string') : []
          for (const v of values) {
            const label = HAIR_TYPE_LABELS[v]
            if (label)
              type.push(label)
          }
          break
        }
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

  return {
    status: 'success',
    code: 'BARCODE_PRINTED',
    message: 'Barcodes printed',
    doc,
  }
}
