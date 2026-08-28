import type {
  BarcodeDTOPopulated,
  CreateBarcodeResponse,
  EditBarcodeResponse,
  GenerateCodeResponse,
  GetBarcodeByCodeResponse,
  GetBarcodesResponse,
  LanguageCode,
  PrintBarcodeResponse,
  ProductPopulatedDTO,
  RemoveBarcodesResponse,
} from '@remnant/shared'
import type {
  CreateBarcodesPayload,
  EditBarcodesPayload,
  GetBarcodeByCodePayload,
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
import { parseGetBarcodes } from '@/types/'
import { getHardcodeData, HttpError } from '@/utils/'

export type PdfKitDoc = InstanceType<typeof PDFDocument>

export async function get({ payload }: { payload: GetBarcodesPayload }): Promise<GetBarcodesResponse> {
  const { items, total, page, pageSize } = await barcodesRepo.list(payload)

  const mappedItems = items.map(item => mapBarcodeToDTO(item))

  return {
    status: 'success',
    code: 'BARCODES_FETCHED',
    message: 'Barcodes fetched',
    data: {
      items: mappedItems,
      pagination: { total, page, pageSize },
    },
  }
}

export async function getByCode({ payload }: { payload: GetBarcodeByCodePayload }): Promise<GetBarcodeByCodeResponse> {
  const { items } = await barcodesRepo.list(parseGetBarcodes({ filters: { codes: [payload.code] } }))

  if (items === null)
    throw new HttpError(400, 'Barcode not found', 'BARCODE_NOT_FOUND')

  const mappedItems = items.map(item => mapBarcodeToDTO(item))

  return {
    status: 'success',
    code: 'BARCODE_FETCHED',
    message: 'Barcode fetched',
    data: mappedItems[0],
  }
}

export async function create({ payload }: { payload: CreateBarcodesPayload }): Promise<CreateBarcodeResponse> {
  let { code, products, active } = payload

  const parsedProducts = products.map(product => ({
    _id: product.id,
    unitsPerScan: product.unitsPerScan,
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
    unitsPerScan: product.unitsPerScan,
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

  const mappedBarcodes = barcodes.map(item => mapBarcodeToDTO(item))

  if (mappedBarcodes.length === 0)
    throw new HttpError(400, 'Barcodes not found', 'BARCODES_NOT_FOUND')

  if (size === '60x30')
    return print60x30({ barcodes: mappedBarcodes, size, language })

  if (size === '55x40')
    return print55x40({ barcodes: mappedBarcodes, size, language })

  return print20x30({ barcodes: mappedBarcodes, size, language })
}

async function print20x30(payload: { barcodes: BarcodeDTOPopulated[], size: string, language: LanguageCode }): Promise<PrintBarcodeResponse<PdfKitDoc>> {
  const { barcodes, size, language } = payload
  const [w, h] = size.split('x').map(Number)
  const padding = 10
  const contentWidth = w * 8.49 - padding * 2
  const contentHeight = h * 8.49 - padding * 2

  const doc = new PDFDocument({ autoFirstPage: false })

  doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
  doc.font('Manrope')

  for (const barcode of barcodes) {
    if (barcode.products.length === 0)
      continue
    const product = barcode.products[0]

    doc.fontSize(18)
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
      contentHeight / 2 + 15,
      { width: contentWidth, height: 25, align: 'center', ellipsis: true, lineBreak: false },
    )

    doc.text(
      product.names?.[language] ?? 'ERROR',
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

async function print60x30(payload: { barcodes: BarcodeDTOPopulated[], size: string, language: LanguageCode }): Promise<PrintBarcodeResponse<PdfKitDoc>> {
  const { barcodes, size, language } = payload
  const [w, h] = size.split('x').map(Number)
  const padding = 10
  const contentWidth = w * 8.49 - padding * 2
  const contentHeight = h * 8.49 - padding * 2
  const { propertyIds } = getHardcodeData()

  const doc = new PDFDocument({ autoFirstPage: false })

  doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
  doc.font('Manrope')

  for (const barcode of barcodes) {
    if (barcode.products.length === 0)
      continue
    const product = barcode.products[0]

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

    doc.text(barcode.code, padding, contentHeight / 2 + 10, {
      width: contentWidth,
      height: 25,
      align: 'center',
      ellipsis: true,
      lineBreak: false,
    })

    doc.text(product.names?.[language] ?? 'ERROR', padding, doc.y, {
      width: contentWidth,
      height: 50,
      ellipsis: true,
      lineBreak: false,
    })

    const propertiesText = product.productProperties
      .map((property) => {
        if (typeof property.value === 'number') {
          if (property.id === propertyIds.LENGTH)
            return `${property.value} cm`
          if (property.id === propertyIds.WEIGHT)
            return `${property.value} g`
          return String(property.value)
        }

        return property.options.map(option => option.names[language] ?? '').join(', ')
      })
      .filter(Boolean)
      .join(', ')

    if (propertiesText) {
      doc.text(propertiesText, padding, doc.y, {
        width: contentWidth,
        height: 50,
        ellipsis: true,
        lineBreak: false,
      })
    }
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
  '7c03598f-3974-4ecb-a556-12f7cb03c3b8',
  '1d341b4a-714e-4779-b6cd-3b085786be3a',
  'e6946264-f2c5-4651-9160-f1b034b25883',
  'c2734e3c-9196-40b1-b05e-d3208d178eca',
  'a51b202e-29a2-4529-843c-3f00a1cec5c6',
]

function getProviderBarcodeSuffix(
  categories: ProductPopulatedDTO['categories'] | undefined,
  providerPrice: Record<string, number>,
): { price: number, suffix: string } {
  const providerCategory = categories?.find(cat => providerPrice[cat.id] != null)
  const categoryId = providerCategory?.id
  const price = categoryId != null
    ? providerPrice[categoryId] ?? 1000
    : 1000
  const suffix = categoryId != null && PROVIDER_E_SUFFIX_CATEGORY_ID.includes(categoryId)
    ? '-e'
    : ''
  return { price, suffix }
}

function getHairTypeLabels(hairTypes: ReturnType<typeof getHardcodeData>['hairTypes']): Record<string, string> {
  return {
    [hairTypes.VIRGIN]: 'Virgin',
    [hairTypes.SILKY]: 'Silky',
    [hairTypes.GOLD]: 'Gold',
    [hairTypes.BROWN]: 'Brown',
    [hairTypes.GRAY]: 'Gray',
    [hairTypes.SLAVIC]: 'Slavic',
    [hairTypes.ALBINO]: 'Albino',
    [hairTypes.RED]: 'Red',
    [hairTypes.CURLY]: 'Curly',
  }
}

function getColorCategoryLabels(colorCategories: ReturnType<typeof getHardcodeData>['colorCategories']): Record<string, string> {
  return {
    [colorCategories.NATURAL_COLOR]: 'Natural Color',
    [colorCategories.BALAYAGE]: 'Balayage',
    [colorCategories.OMBRE]: 'Ombre',
    [colorCategories.PLATIN]: 'Platin',
    [colorCategories.BLONDE]: 'Blonde',
  }
}

function extractProductPrintFields(
  product: ProductPopulatedDTO,
  language: LanguageCode,
  hardcode: ReturnType<typeof getHardcodeData>,
) {
  const { propertyIds, hairTypes, colorCategories } = hardcode
  const hairTypeLabels = getHairTypeLabels(hairTypes)
  const colorCategoryLabels = getColorCategoryLabels(colorCategories)

  let length = ''
  let weight = ''
  let segment = 'Standard'
  let colorCategory = ''
  const type: string[] = []
  const info: string[] = []

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
        const values = Array.isArray(prop.value)
          ? prop.value.filter((x): x is string => typeof x === 'string')
          : []
        for (const value of values) {
          const label = hairTypeLabels[value]
          if (label) {
            type.push(label)
          }
          else {
            type.push('Raw')
          }
        }
        break
      }

      case propertyIds.SEGMENT:
        segment = prop.options.map(option => option.names[language] ?? '').join(', ') || segment
        break

      case propertyIds.COLOR_CATEGORY: {
        const value = typeof prop.value === 'string'
          ? prop.value
          : prop.options[0]?.id
        if (value != null && colorCategoryLabels[value])
          colorCategory = colorCategoryLabels[value]
        break
      }

      case propertyIds.STRUCTURE:
        if (propertyIds.STRUCTURE)
          info.push(`Structure: ${prop.options.map(option => option.names[language] ?? '').join(', ')}`)
        break

      case propertyIds.COMBING:
        if (propertyIds.COMBING)
          info.push(`Combing: ${prop.options.map(option => option.names[language] ?? '').join(', ')}`)
        break

      case propertyIds.PROCCESSING_TYPE:
        if (propertyIds.PROCCESSING_TYPE)
          info.push(`Processing: ${prop.options.map(option => option.names[language] ?? '').join(', ')}`)
        break

      case propertyIds.COLOR:
        if (propertyIds.COLOR)
          info.push(`Color: ${prop.options.map(option => option.names[language] ?? '').join(', ')}`)
        break
    }
  }

  const bigCode = ((product.names?.[language] ?? '').split('#')[1] ?? '0000').trim()
  const lenWgt = [length, weight].filter(Boolean).join(', ')

  return { length, weight, lenWgt, type, segment, colorCategory, bigCode, info }
}

async function print55x40(payload: { barcodes: BarcodeDTOPopulated[], size: string, language: LanguageCode }): Promise<PrintBarcodeResponse<PdfKitDoc>> {
  const hardcode = getHardcodeData()
  const { propertyGroups, providerPrice } = hardcode

  const isDyed = payload.barcodes.some(
    barcode => barcode.products[0]?.productPropertiesGroup?.id === propertyGroups.dyed,
  )

  if (isDyed && propertyGroups.dyed)
    return print55x40Dyed(payload)

  const { barcodes, size, language } = payload
  const [w, h] = size.split('x').map(Number)
  const padding = 10
  const contentWidth = w * 8.49 - padding * 2
  const contentHeight = h * 8.49 - padding * 2

  const doc = new PDFDocument({ autoFirstPage: false })

  doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
  doc.registerFont('Manrope-Bold', path.resolve(__dirname, '../utils/fonts/Manrope-Bold.ttf'))

  for (const barcode of barcodes) {
    if (barcode.products.length === 0)
      continue
    const product = barcode.products[0]

    const { price: providerPriceValue, suffix: providerSuffixMark } = getProviderBarcodeSuffix(product.categories, providerPrice)
    const { lenWgt, type, bigCode } = extractProductPrintFields(product, language, hardcode)

    const barcodePng = await bwipjs.toBuffer({
      bcid: 'code128',
      text: barcode.code,
      scale: 8,
      height: 20,
      includetext: false,
      textxalign: 'center',
    })

    const drawBigCode = (offsetY: number) => {
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
        const textWidth = doc.widthOfString(bigCode, { characterSpacing })
        const textHeight = doc.currentLineHeight()
        if (textWidth <= maxWidth && textHeight <= maxHeight)
          break
        fontSize -= 1
      }

      const textWidth = doc.widthOfString(bigCode, { characterSpacing })
      const x = (pageWidth - textWidth) / 2
      const y = doc.y + offsetY

      doc.text(bigCode, x, y, {
        lineBreak: false,
        height: 20,
        characterSpacing,
        baseline: 'middle',
      })
    }

    const backPage = () => {
      doc.addPage({
        size: [w * 8.49, h * 8.49],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      })

      doc.image(barcodePng, padding, padding, {
        width: contentWidth,
        height: contentHeight / 5,
      })

      doc.font('Manrope').fontSize(16).text(
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

      drawBigCode(75)

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

    const frontPage = () => {
      doc.addPage({
        size: [w * 8.49, h * 8.49],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      })

      drawBigCode(105)

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

    backPage()
    frontPage()
  }

  return {
    status: 'success',
    code: 'BARCODE_PRINTED',
    message: 'Barcodes printed',
    doc,
  }
}

async function print55x40Dyed(payload: {
  barcodes: BarcodeDTOPopulated[]
  size: string
  language: LanguageCode
}): Promise<PrintBarcodeResponse<PdfKitDoc>> {
  const { barcodes } = payload
  const language: LanguageCode = 'en'
  const w = 58
  const h = 81
  const padding = 10
  const contentWidth = w * 8.49 - padding * 2
  const contentHeight = h * 8.49 - padding * 2

  const hardcode = getHardcodeData()
  const { providerPrice, symbol } = hardcode

  const doc = new PDFDocument({ autoFirstPage: false })

  doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
  doc.registerFont('Manrope-Bold', path.resolve(__dirname, '../utils/fonts/Manrope-Bold.ttf'))

  for (const barcode of barcodes) {
    if (barcode.products.length === 0)
      continue
    const product = barcode.products[0]

    const { length, weight, segment, colorCategory, bigCode, info } = extractProductPrintFields(product, language, hardcode)
    const lenWgt = [length || '000cm', weight || '000g'].join(', ')

    doc.font('Manrope')
    doc.fontSize(25)
    doc.addPage({ size: [w * 8.49, h * 8.49] })

    const frontside = () => {
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
      doc.text(bigCode || '00000', padding, bigCodeHeight + 40, {
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

    const backside = async () => {
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
        = getProviderBarcodeSuffix(product.categories, providerPrice)

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

    frontside()
    await backside()
  }

  return {
    status: 'success',
    code: 'BARCODE_PRINTED',
    message: 'Barcodes printed',
    doc,
  }
}
