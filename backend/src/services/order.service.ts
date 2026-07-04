import type {
  AuthUser,
  CreateOrderResponse,
  EditOrderResponse,
  GetOrderDetailsResponse,
  GetOrderItemsResponse,
  GetOrderPaymentsResponse,
  GetOrdersResponse,
  PayOrderResponse,
  PipeableDocument,
  PrintDraftInvoiceOrderResponse,
  PrintInvoiceOrderResponse,
  PrintOrderLabelOrderResponse,
  RemoveOrdersResponse,
} from '@remnant/shared'
import type { ClientSession } from 'mongoose'
import type {
  CreateOrderPayload,
  EditOrderPayload,
  GetOrderDetailsPayload,
  GetOrderItemsPayload,
  GetOrderPaymentsPayload,
  GetOrdersPayload,
  PayOrderPayload,
  PrintDraftInvoiceOrderPayload,
  PrintInvoiceOrderPayload,
  PrintOrderLabelOrderPayload,
  RemoveOrdersPayload,
} from '@/types'
import path from 'node:path'
import mongoose from 'mongoose'
import PDFDocument from 'pdfkit'
import { v4 as uuidv4 } from 'uuid'
import { mapOrderItemPopulatedToDTO, mapOrderPaymentPopulatedItem, mapOrderPopulatedToDTO } from '@/mappers'
import * as CurrencyRepo from '@/repositories/currencies.repo'
import * as OrderPaymentRepository from '@/repositories/order-payment.repo'
import * as OrderRepository from '@/repositories/order.repo'
import * as ProductsRepository from '@/repositories/products.repo'
import * as AutomationService from '@/services/automation.service'
import * as ExchangeRateService from '@/services/currency.service'
import * as MoneyTransactionService from '@/services/money-transaction.service'
import * as OrderPaymentService from '@/services/order-payment.service'
import * as QuantityService from '@/services/quantity.service'
import * as UserService from '@/services/user.service'
import { parseGetCurrency, parseGetOrderItems, parseGetOrderPayments, parseGetOrders } from '@/types/'
import { drawHr, getDifferenceDeep, getHardcodeData, HttpError } from '@/utils'
import { toMinor } from '@/utils/money'
import {
  buildCalculationCurrency,
  buildPaymentsByCurrency,
  buildPricesByCurrency,
  getPaymentStatus,
  resolveCalculationCurrency,
} from '@/utils/order-payment-status'

type PDFDoc = PDFKit.PDFDocument

export async function get({ payload, user }: { payload: GetOrdersPayload, user: AuthUser }): Promise<GetOrdersResponse> {
  const hasProfitPermission = await UserService.checkPermission('order.profit', user.id)

  const { items, total, page, pageSize } = await OrderRepository.list({
    payload: {
      filters: payload.filters,
      pagination: payload.pagination,
      sorters: payload.sorters,
      hasProfitPermission,
    },
  })

  return {
    status: 'success',
    code: 'ORDERS_FETCHED',
    message: 'Orders fetched',
    data: {
      items: items.map(mapOrderPopulatedToDTO),
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function getItems({ payload, user }: { payload: GetOrderItemsPayload, user: AuthUser }): Promise<GetOrderItemsResponse> {
  const hasProfitPermission = await UserService.checkPermission('order.profit', user.id)

  const { items, total, page, pageSize } = await OrderRepository.listItems({
    payload: {
      filters: payload.filters,
      pagination: payload.pagination,
      hasProfitPermission,
    },
  })

  return {
    status: 'success',
    code: 'ORDER_ITEMS_FETCHED',
    message: 'Order items fetched',
    data: {
      items: items.map(mapOrderItemPopulatedToDTO),
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function getDetails({ payload, user }: { payload: GetOrderDetailsPayload, user: AuthUser }): Promise<GetOrderDetailsResponse> {
  const { data: { items: [order] } } = await get({
    payload: parseGetOrders({ filters: { seq: String(payload.seq) }, pagination: { full: true } }),
    user,
  })

  if (order === null)
    throw new HttpError(404, 'Order not found', 'ORDER_NOT_FOUND')

  const { data: { items } } = await getItems({
    payload: parseGetOrderItems({ filters: { order: [order.id] }, pagination: { full: true } }),
    user,
  })

  const { data: { items: payments } } = await getOrderPayments({
    payload: parseGetOrderPayments({ filters: { order: [order.id] }, pagination: { full: true } }),
  })

  return {
    status: 'success',
    code: 'ORDER_DETAILS_FETCHED',
    message: 'Order details fetched',
    data: {
      order,
      items,
      payments,
    },
  }
}

export async function getOrderPayments({ payload }: { payload: GetOrderPaymentsPayload }): Promise<GetOrderPaymentsResponse> {
  const { items, total, page, pageSize } = await OrderRepository.listPayments({ payload })

  return {
    status: 'success',
    code: 'ORDER_PAYMENTS_FETCHED',
    message: 'Order payments fetched',
    data: {
      items: items.map(mapOrderPaymentPopulatedItem),
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function create({ payload, user }: { payload: CreateOrderPayload, user: AuthUser }): Promise<CreateOrderResponse> {
  const orderId = uuidv4()
  const createdOrderPayments = []

  const { items: currencies } = await CurrencyRepo.list(parseGetCurrency({ filters: { active: [true] } }))

  for (const payment of payload.orderPayments) {
    if (!payment)
      continue

    const { data: orderPayment } = await OrderPaymentService.create({
      payload: {
        amount: payment.amount,
        currencyId: payment.currency,
        cashregisterId: payment.cashregister,
        cashregisterAccountId: payment.cashregisterAccount,
        paymentStatus: payment.paymentStatus,
        comment: payment.comment,
        createdBy: user.id.toString(),
        paymentDate: payment.paymentDate !== undefined ? new Date(payment.paymentDate) : new Date(),
        orderId,
      },
    })

    createdOrderPayments.push(orderPayment)

    await MoneyTransactionService.createTransaction({
      payload: {
        type: 'income',
        direction: 'in',
        accountId: payment.cashregisterAccount,
        cashregisterId: payment.cashregister,
        sourceModel: 'order',
        sourceId: orderId,
        currencyId: payment.currency,
        amount: payment.amount,
        description: `Payment for order ${orderId}`,
      },
    })
  }

  for (const item of payload.items) {
    const product = await ProductsRepository.findById(item.product)

    if (!product)
      throw new HttpError(400, 'Product not found', 'PRODUCT_NOT_FOUND')

    const currency = currencies.find(c => c.id === item.currency)
    const purchaseCurrency = currencies.find(c => c.id === product.purchaseCurrencyId)

    if (!currency || !purchaseCurrency)
      throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

    const { profit, exchangeRate } = await calculateProfit({
      item: {
        price: toMinor(item.price, currency.scale),
        currency: item.currency,
      },
      purchasePrice: product.minorPurchasePrice,
      purchaseCurrency: product.purchaseCurrencyId,
    })

    await OrderRepository.createOneItem({
      payload: {
        product: item.product,
        quantity: item.quantity,
        currency: item.currency,
        minorManualPrice: toMinor(item.price, currency.scale),
        minorBasePrice: toMinor(item.basePrice, currency.scale),
        minorPrice: toMinor(item.price, currency.scale),
        minorPurchasePrice: product.minorPurchasePrice,
        minorProfit: profit,
        minorDiscountAmount: item.discountAmount !== undefined ? toMinor(item.discountAmount, currency.scale) : 0,
        discountPercent: item.discountPercent,
        order: orderId,
        purchaseCurrency: product.purchaseCurrencyId,
        exchangeRate,
        createdBy: user.id.toString(),
      },
    })

    await QuantityService.count({
      payload: {
        mode: 'dec',
        productId: item.product,
        count: item.quantity,
        warehouse: payload.warehouse,
        userId: user.id.toString(),
        refType: 'order',
        refId: orderId,
      },
    })
  }

  const totalPrice = buildPricesByCurrency(payload.items, currencies)

  const totalPayments = buildPaymentsByCurrency(
    createdOrderPayments.map(p => ({
      currency: p.currency.id,
      amount: p.amount,
    })),
    currencies,
  )

  const orderPaymentStatus = await computeOrderPaymentStatus(
    totalPrice,
    totalPayments,
    currencies,
  )

  const createdOrder = await OrderRepository.createOne({
    payload: {
      ...payload,
      _id: orderId,
      orderPayments: createdOrderPayments.map(p => p.id),
      orderPaymentStatus,
    },
  })

  if (createdOrder === null)
    throw new HttpError(400, 'Order not created', 'ORDER_NOT_CREATED')

  await AutomationService.run({
    payload: {
      type: 'order-created',
      entityId: createdOrder[0]._id,
      user: user.id,
    },
  })

  return {
    status: 'success',
    code: 'ORDER_CREATED',
    message: 'Order created',
  }
}

export async function payOrder({ payload, user }: { payload: PayOrderPayload, user: AuthUser }): Promise<PayOrderResponse> {
  const { id } = payload

  // const { data: order } = await OrderRepository.getById({ id })

  // const { data: { items: cashregisters } } = await CashregisterService.get({})

  // const { users } = await UserService.get({ filters: { login: user.login } })
  // if (users.length === 0) {
  //   throw new HttpError(400, 'User not found', 'USER_NOT_FOUND')
  // }
  // const userData = users[0]

  // const payments = mapTotalsToPayments(order.totals, cashregisters[0])

  // const createdOrderPayments = []

  // for (const payment of payments) {
  //   const createdOrderPayment = await OrderPaymentService.create({
  //     order: id,
  //     cashregister: payment.cashregister,
  //     cashregisterAccount: payment.cashregisterAccount,
  //     amount: payment.amount,
  //     currency: payment.currency,
  //     createdBy: user.id.toString(),
  //     paymentStatus: 'paid',
  //     paymentDate: new Date(),
  //     comment: '',
  //   })
  //   createdOrderPayments.push(createdOrderPayment.orderPayment.id)

  //   await MoneyTransactionService.create({
  //     type: 'income',
  //     direction: 'in',
  //     account: payment.cashregisterAccount,
  //     cashregister: payment.cashregister,
  //     sourceModel: 'order',
  //     sourceId: id,
  //     currency: payment.currency,
  //     amount: payment.amount,
  //     description: `Payment for order ${id}`,
  //   })
  // }

  // function mapTotalsToPayments(totals: { currency: string, total: number }[], cashregister: any) {
  //   const payments = []

  //   for (const { currency, total } of totals) {
  //     const matchingAccount = cashregister.accounts.find((account: any) =>
  //       account.currencies.some((c: any) => c.id === currency),
  //     )

  //     if (!matchingAccount)
  //       continue

  //     const matchingCurrency = matchingAccount.currencies.find((c: any) => c.id === currency)

  //     if (!matchingCurrency)
  //       continue

  //     payments.push({
  //       cashregister: cashregister.id,
  //       cashregisterAccount: matchingAccount.id,
  //       currency: matchingCurrency.id,
  //       amount: total,
  //     })
  //   }

  //   return payments
  // }

  // await OrderModel.findOneAnd, Update({ _id: id }, { orderPayments: createdOrderPayments, orderPaymentStatus: 'paid' })

  return {
    status: 'success',
    code: 'ORDER_PAYED',
    message: 'Order payed',
  }
}

export async function edit({ payload, user }: { payload: EditOrderPayload, user: AuthUser }): Promise<EditOrderResponse> {
  const session = await mongoose.startSession()

  try {
    let editedOrder = null

    await session.withTransaction(async () => {
      const { id, items, orderPayments, warehouse } = payload
      const userId = user.id.toString()

      await applyItemsDiff({
        orderId: id,
        warehouseId: warehouse,
        items,
        userId,
        session,
      })

      const activePaymentIds = await applyPaymentsDiff({
        orderId: id,
        payments: orderPayments.filter(p => p !== undefined),
        userId,
        session,
      })

      const { items: currencies } = await CurrencyRepo.list(parseGetCurrency({
        filters: { active: [true] },
        pagination: { full: true },
      }))

      const totalPriceByCurrency = buildPricesByCurrency(items, currencies)

      const totalPaymentsByCurrency = buildPaymentsByCurrency(
        orderPayments.filter((payment): payment is NonNullable<typeof payment> => payment !== undefined),
        currencies,
      )

      const orderPaymentStatus = await computeOrderPaymentStatus(
        totalPriceByCurrency,
        totalPaymentsByCurrency,
        currencies,
      )

      const order = await OrderRepository.updateById({
        id,
        payload: {
          ...payload,
          orderPayments: activePaymentIds,
          orderPaymentStatus,
        },
        session,
      })

      if (!order)
        throw new HttpError(400, 'Order not edited', 'ORDER_NOT_EDITED')

      await AutomationService.run({
        payload: {
          type: 'order-updated',
          entityId: order._id,
          user: user.id,
        },
        session,
      })

      editedOrder = order
    })

    if (editedOrder === null)
      throw new HttpError(400, 'Order not edited', 'ORDER_NOT_EDITED')

    return {
      status: 'success',
      code: 'ORDER_EDITED',
      message: 'Order edited',
    }
  }
  finally {
    await session.endSession()
  }
}

export async function remove({ payload, user }: { payload: RemoveOrdersPayload, user: AuthUser }): Promise<RemoveOrdersResponse> {
  for (const id of payload.ids) {
    await OrderRepository.removeById(id)

    await AutomationService.run({
      payload: {
        type: 'order-removed',
        entityId: id,
        user: user.id,
      },
    })
  }

  return {
    status: 'success',
    code: 'ORDERS_REMOVED',
    message: 'Orders removed',
  }
}

export async function printInvoice({ payload }: { payload: PrintInvoiceOrderPayload }): Promise<PrintInvoiceOrderResponse> {
  const { seq, language } = payload
  const config = {
    mm: 2.83464567,
    page: {
      widthMm: 210,
      heightMm: 297,
    },
    contentWidth: 210 * 2.83464567 - 30 * 2 - 30 * 2,
    contentHeight: 297 * 2.83464567 - 50 * 2 - 50 * 2,
    margins: {
      top: 50,
      bottom: 50,
      left: 30,
      right: 30,
    },
    size: [210 * 2.83464567, 297 * 2.83464567],
  }

  const { propertyIds, hairTypes, invoicePrefix, invoiceAddition } = getHardcodeData()

  const order = await OrderRepository.findOne({ payload: { seq } })

  if (!order)
    throw new HttpError(400, 'Order not found', 'ORDER_NOT_FOUND')

  const { items } = await OrderRepository.listItems({
    payload: {
      filters: { order: [order.id] },
      pagination: { current: 1, pageSize: 1000, full: true },
      hasProfitPermission: false,
    },
  })

  const hasDiscount = items.some(item => item.minorManualPrice > 0 || item.discountPercent > 0)

  const tableColumns = {
    name: { key: 'name', width: 100, x: config.margins.left, align: 'left', type: 'text' },
    length: { key: 'length', width: 50, x: config.margins.left + 100, align: 'left', type: 'text' },
    weight: { key: 'weight', width: 50, x: config.margins.left + 150, align: 'left', type: 'text' },
    type: { key: 'type', width: 80, x: config.margins.left + 200, align: 'left', type: 'text' },
    price: { key: 'price', width: 60, x: config.margins.left + 280, align: 'left', type: 'text' },
    quantity: { key: 'quantity', width: 60, x: config.margins.left + 340, align: 'left', type: 'text' },
    discount: { key: 'discount', width: 50, x: config.margins.left + 400, align: 'left', type: 'text' },
    total: { key: 'total', width: 100, x: config.page.widthMm - config.margins.right - 100, align: 'right', type: 'text' },
  }

  const measureRowHeight = ({ doc, columns, options }: { doc: PDFDoc, columns: { key: string, width: number, x: number, align?: string, type?: string, value: string }[], options?: { padding?: number, maxHeight?: number, minHeight?: number } }) => {
    const padding = options?.padding ?? 6
    const maxHeight = options?.maxHeight ?? 70
    let height = options?.minHeight ?? 18

    for (const col of columns) {
      if (col.type === 'text') {
        const textH = doc.heightOfString(String(col.value ?? ''), {
          width: Math.max(0, col.width - padding * 2),
          align: col.align as 'left' | 'right',
        })
        height = Math.max(height, textH + padding * 2)
      }
      else if (col.type === 'image') {
        height = Math.max(height, maxHeight)
      }
    }
    return height
  }

  const drawTableRow = (doc: PDFDoc, columns: { key: string, width: number, x: number, align?: string, type?: string, value: string }[]) => {
    const y = doc.y
    const rowHeight = measureRowHeight({ doc, columns, options: { maxHeight: 70, minHeight: 22 } })
    for (const column of columns) {
      if (column.type === 'text') {
        doc.text(column.value, column.x, y, { width: column.width, align: column.align as 'left' | 'right' })
      }
      else if (column.type === 'image') {
        doc.image(column.value, column.x, y, {
          width: column.width,
          fit: [Math.max(0, column.width - 6 * 2), Math.max(0, rowHeight - 6 * 2)],
        })
      }
    }
  }

  const drawHr = (doc: PDFDoc, gapTopPx = 6, gapBottomPx = 6) => {
    const y = doc.y + gapTopPx
    doc
      .strokeColor('#D9D9D9')
      .lineWidth(1)
      .moveTo(doc.x, y)
      .lineTo(doc.page.width - doc.page.margins.right, y)
      .stroke()
    doc.y = y + gapBottomPx
  }

  const ensureSpace = ({ doc, needPx, size, margins, onNewPage }: { doc: PDFDoc, needPx: number, size: number[], margins: { top: number, bottom: number, left: number, right: number }, onNewPage?: () => void }) => {
    const pageBottom = doc.page.height - doc.page.margins.bottom
    if (doc.y + needPx > pageBottom) {
      doc.addPage({ size, margins })
      if (onNewPage)
        onNewPage()
    }
  }

  const renderTableHeader = (doc: PDFDoc) => {
    doc.fontSize(10).font('Manrope-Bold')
    const headerRow = [
      {
        ...tableColumns.name,
        value: 'Name',
      },
      {
        ...tableColumns.length,
        value: 'Length',
      },
      {
        ...tableColumns.weight,
        value: 'Weight',
      },
      {
        ...tableColumns.type,
        value: 'Type',
      },
      {
        ...tableColumns.price,
        value: 'Price',
      },
      {
        ...tableColumns.quantity,
        value: 'Quantity',
      },
      ...(hasDiscount ? [{ ...tableColumns.discount, value: 'Discount' }] : []),
      {
        ...tableColumns.total,
        value: 'Total',
      },
    ]
    drawTableRow(doc, headerRow)
    drawHr(doc, 8, 8)
    doc.font('Manrope')
  }

  const doc = new PDFDocument({ autoFirstPage: false })

  doc.addPage({ size: config.size, margins: config.margins })

  doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
  doc.registerFont('Manrope-Bold', path.resolve(__dirname, '../utils/fonts/Manrope-ExtraBold.ttf'))

  doc.fontSize(32)
  doc.font('Manrope-Bold')
  doc.image(
    path.resolve(__dirname, '../utils/invoice/logo.png'),
    config.margins.left,
    doc.y,
    { width: 141.67, height: 50 },
  )
  doc.text(
    `${invoicePrefix}${order.seq + invoiceAddition}`,
    config.margins.left,
    doc.y,
    { width: config.contentWidth, height: 25, align: 'right', ellipsis: true, lineBreak: false },
  )

  drawHr(doc, 8, 8)

  // CLIENT

  if (order.client !== null) {
    doc.fontSize(12)
    doc.font('Manrope-Bold')
    doc.text(
      'Client:',
      config.margins.left,
      doc.y,
      { width: config.contentWidth, height: 25, align: 'left', ellipsis: true, lineBreak: false },
    )

    doc.fontSize(10)
    doc.font('Manrope')
    if (order.client.name !== undefined || order.client.lastName !== undefined || order.client.middleName !== undefined) {
      doc.text(
        `${order.client.name ?? ''} ${order.client.lastName ?? ''} ${order.client.middleName ?? ''}`,
        config.margins.left,
        doc.y,
        { width: config.contentWidth, height: 25, align: 'left', ellipsis: true, lineBreak: false },
      )
    }

    if (order.client.phones !== undefined && order.client.phones.length > 0) {
      doc.text(
        `${order.client.phones.join(', ')}`,
        config.margins.left,
        doc.y,
        { width: config.contentWidth, height: 25, align: 'left', ellipsis: true, lineBreak: false },
      )
    }

    if (order.client.emails !== undefined && order.client.emails.length > 0) {
      doc.text(
        `${order.client.emails.join(', ')}`,
        config.margins.left,
        doc.y,
        { width: config.contentWidth, height: 25, align: 'left', ellipsis: true, lineBreak: false },
      )
    }

    drawHr(doc, 8, 8)
  }

  // CLIENT

  // INVOICE DATE

  const fmt = new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  doc.fontSize(12)
  doc.font('Manrope-Bold')
  doc.text(
    'Invoice date:',
    config.margins.left,
    doc.y,
  )
  doc.fontSize(10)
  doc.font('Manrope')
  doc.text(
    `${fmt.format(order.createdAt)}`,
    config.margins.left,
    doc.y,
  )
  doc.font('Manrope-Bold')

  drawHr(doc, 8, 8)

  // INVOICE DATE

  // PRODUCTS

  function getProductPrice(lengthCm: number, type: any[]): number | null {
    let table = [
      { min: 40, max: 44, price: 900 },
      { min: 45, max: 49, price: 950 },
      { min: 50, max: 54, price: 1000 },
      { min: 55, max: 59, price: 1150 },
      { min: 60, max: 64, price: 1200 },
      { min: 65, max: 69, price: 1250 },
      { min: 70, max: 74, price: 1300 },
      { min: 75, max: 79, price: 1350 },
      { min: 80, max: 84, price: 1400 },
      { min: 85, max: 89, price: 1500 },
      { min: 90, max: 94, price: 1600 },
      { min: 95, max: 99, price: 1700 },
      { min: 100, max: 104, price: 1800 },
      { min: 105, max: 109, price: 1900 },
      { min: 110, max: 114, price: 2000 },
    ]

    let multiply = 1

    if (type.includes(hairTypes.CURLY)) {
      multiply = 1.3
    }

    if (type.includes(hairTypes.VIRGIN)) {
      table = [
        { min: 40, max: 44, price: 1800 },
        { min: 45, max: 49, price: 1900 },
        { min: 50, max: 54, price: 2000 },
        { min: 55, max: 59, price: 2100 },
        { min: 60, max: 64, price: 2200 },
        { min: 65, max: 69, price: 2300 },
        { min: 70, max: 74, price: 2400 },
        { min: 75, max: 79, price: 2500 },
        { min: 80, max: 84, price: 2600 },
        { min: 85, max: 89, price: 2700 },
        { min: 90, max: 94, price: 2800 },
        { min: 95, max: 99, price: 2900 },
        { min: 100, max: 104, price: 3000 },
        { min: 105, max: 109, price: 3100 },
        { min: 110, max: 114, price: 3200 },
      ]
    }

    if (type.includes(hairTypes.SLAVIC)) {
      table = [
        { min: 40, max: 44, price: 3600 },
        { min: 45, max: 49, price: 3700 },
        { min: 50, max: 54, price: 4800 },
        { min: 55, max: 59, price: 4900 },
        { min: 60, max: 64, price: 4000 },
        { min: 65, max: 69, price: 4100 },
        { min: 70, max: 74, price: 4200 },
        { min: 75, max: 79, price: 4300 },
        { min: 80, max: 84, price: 4400 },
        { min: 85, max: 89, price: 4500 },
        { min: 90, max: 94, price: 4600 },
        { min: 95, max: 99, price: 4700 },
        { min: 100, max: 104, price: 4800 },
        { min: 105, max: 109, price: 4900 },
        { min: 110, max: 114, price: 5000 },
      ]
      multiply = 1
    }

    if (type.includes(hairTypes.SILKY) || type.includes(hairTypes.BROWN)) {
      table = [
        { min: 40, max: 44, price: 1300 },
        { min: 45, max: 49, price: 1400 },
        { min: 50, max: 54, price: 1500 },
        { min: 55, max: 59, price: 1600 },
        { min: 60, max: 64, price: 1700 },
        { min: 65, max: 69, price: 1800 },
        { min: 70, max: 74, price: 1900 },
        { min: 75, max: 79, price: 2000 },
        { min: 80, max: 84, price: 2100 },
        { min: 85, max: 89, price: 2200 },
        { min: 90, max: 94, price: 2300 },
        { min: 95, max: 99, price: 2400 },
        { min: 100, max: 104, price: 2500 },
      ]
    }

    for (const row of table) {
      if (lengthCm >= row.min && lengthCm <= row.max) {
        return row.price * multiply
      }
    }
    return null
  }

  // function getNewProductPrice(weightGrams: number, packPrice: number) {
  //   return Math.round((packPrice * 1000) / weightGrams)
  // }

  const invoiceItems = items.map((item) => {
    if (item === null)
      return null

    const type = item.product.productProperties.find(property => property.id === propertyIds.HAIR_TYPE)
    const weight = item.product.productProperties.find(property => property.id === propertyIds.WEIGHT)
    const length = item.product.productProperties.find(property => property.id === propertyIds.LENGTH)
    const discount = item.minorManualPrice > 0 ? item.minorManualPrice * item.quantity : item.discountPercent > 0 ? item.discountPercent : 0
    const discountType = item.minorManualPrice > 0 ? 'amount' : item.discountPercent > 0 ? 'percent' : 'none'

    if (!type || !weight || !length)
      return null

    return {
      name: item.product.names[language] ?? '',
      length: length.value as number,
      weight: weight.value as number,
      type: type?.options.map(option => option.names[language] ?? '').join(', ') || '',
      price: getProductPrice(length.value as number, type.options.map(option => option.id)),
      quantity: item.quantity,
      total: item.minorPrice * item.quantity,
      currency: item.currency,
      discount,
      discountType,
    }
  }).filter(p => p !== null).sort((a, b) => a.length - b.length)

  doc.fontSize(10)

  renderTableHeader(doc)

  const totals: { count: number, weight: number, amount: Record<string, { currency: { id: string, symbols: Record<string, string> }, total: number }> } = { count: 0, weight: 0, amount: {} }
  for (const item of invoiceItems) {
    doc.font('Manrope')
    doc.fontSize(10)
    const row = [
      {
        ...tableColumns.name,
        value: item.name,
      },
      {
        ...tableColumns.length,
        value: `${item.length} cm`,
      },
      {
        ...tableColumns.weight,
        value: `${item.weight} g`,
      },
      {
        ...tableColumns.type,
        value: `${item.type}`,
      },
      {
        ...tableColumns.price,
        value: `${item.price} ${item.currency.symbols[language] ?? ''}`,
      },
      {
        ...tableColumns.quantity,
        value: `${item.quantity} pcs`,
      },
      ...(hasDiscount ? [{ ...tableColumns.discount, value: `${item.discount} ${item.discountType === 'amount' ? item.currency.symbols[language] : '%'}` }] : []),
      {
        ...tableColumns.total,
        value: `${item.total.toFixed(0)} ${item.currency.symbols[language] ?? ''}`,
      },
    ]

    const rowH = measureRowHeight({ doc, columns: row, options: { maxHeight: 70, minHeight: 22 } })
    const hrH = 12
    const needPx = rowH + hrH

    ensureSpace({ doc, needPx, size: config.size, margins: config.margins, onNewPage: () => renderTableHeader(doc) })

    totals.count += item.quantity
    totals.weight += item.weight
    if (totals.amount[item.currency.id] === undefined) {
      totals.amount[item.currency.id] = { currency: item.currency, total: 0 }
    }
    totals.amount[item.currency.id].total += item.total
    drawTableRow(doc, row)
    drawHr(doc, 8, 8)
  }

  const totalRow = [
    {
      ...tableColumns.name,
      value: '',
    },
    {
      ...tableColumns.length,
      value: '',
    },
    {
      ...tableColumns.weight,
      value: `${totals.weight} g`,
    },
    {
      ...tableColumns.type,
      value: '',
    },
    {
      ...tableColumns.price,
      value: ``,
    },
    {
      ...tableColumns.quantity,
      value: `${totals.count} pcs`,
    },
    ...(hasDiscount ? [{ ...tableColumns.discount, value: '' }] : []),
    {
      ...tableColumns.total,
      value: Object.values(totals.amount).map(amount => `${amount.total.toFixed(0)} ${amount.currency.symbols[language] || ''}`).join(', '),
    },
  ]

  doc.font('Manrope-Bold')
  drawTableRow(doc, totalRow)

  return {
    status: 'success',
    code: 'INVOICE_PRINTED',
    message: 'Invoice printed',
    doc: doc as unknown as PipeableDocument,
  }
}

export async function printDraftInvoice({ payload }: { payload: PrintDraftInvoiceOrderPayload }): Promise<PrintDraftInvoiceOrderResponse> {
  const { items, language } = payload

  const config = {
    mm: 2.83464567,
    page: {
      widthMm: 210,
      heightMm: 297,
    },
    contentWidth: 210 * 2.83464567 - 30 * 2 - 30 * 2,
    contentHeight: 297 * 2.83464567 - 50 * 2 - 50 * 2,
    margins: {
      top: 50,
      bottom: 50,
      left: 30,
      right: 30,
    },
    size: [210 * 2.83464567, 297 * 2.83464567],
  }

  const { propertyIds, hairTypes } = getHardcodeData()

  const hasDiscount = items.some(item => item.discountAmount > 0 || item.discountPercent > 0)

  const tableColumns = {
    name: { key: 'name', width: 100, x: config.margins.left, align: 'left', type: 'text' },
    length: { key: 'length', width: 50, x: config.margins.left + 100, align: 'left', type: 'text' },
    weight: { key: 'weight', width: 50, x: config.margins.left + 150, align: 'left', type: 'text' },
    type: { key: 'type', width: 80, x: config.margins.left + 200, align: 'left', type: 'text' },
    price: { key: 'price', width: 60, x: config.margins.left + 280, align: 'left', type: 'text' },
    quantity: { key: 'quantity', width: 60, x: config.margins.left + 340, align: 'left', type: 'text' },
    discount: { key: 'discount', width: 50, x: config.margins.left + 400, align: 'left', type: 'text' },
    total: { key: 'total', width: 100, x: config.page.widthMm - config.margins.right - 100, align: 'right', type: 'text' },
  }

  const measureRowHeight = ({ doc, columns, options }: { doc: PDFDoc, columns: { key: string, width: number, x: number, align?: string, type?: string, value: string }[], options?: { padding?: number, maxHeight?: number, minHeight?: number } }) => {
    const padding = options?.padding ?? 6
    const maxHeight = options?.maxHeight ?? 70
    let height = options?.minHeight ?? 18

    for (const col of columns) {
      if (col.type === 'text') {
        const textH = doc.heightOfString(String(col.value ?? ''), {
          width: Math.max(0, col.width - padding * 2),
          align: col.align as 'left' | 'right',
        })
        height = Math.max(height, textH + padding * 2)
      }
      else if (col.type === 'image') {
        height = Math.max(height, maxHeight)
      }
    }
    return height
  }

  const drawTableRow = (doc: PDFDoc, columns: { key: string, width: number, x: number, align?: string, type?: string, value: string }[]) => {
    const y = doc.y
    const rowHeight = measureRowHeight({ doc, columns, options: { maxHeight: 70, minHeight: 22 } })
    for (const column of columns) {
      if (column.type === 'text') {
        doc.text(column.value, column.x, y, { width: column.width, align: column.align as 'left' | 'right' })
      }
      else if (column.type === 'image') {
        doc.image(column.value, column.x, y, {
          width: column.width,
          fit: [Math.max(0, column.width - 6 * 2), Math.max(0, rowHeight - 6 * 2)],
        })
      }
    }
  }

  const drawHr = (doc: PDFDoc, gapTopPx = 6, gapBottomPx = 6) => {
    const y = doc.y + gapTopPx
    doc
      .strokeColor('#D9D9D9')
      .lineWidth(1)
      .moveTo(doc.x, y)
      .lineTo(doc.page.width - doc.page.margins.right, y)
      .stroke()
    doc.y = y + gapBottomPx
  }

  const ensureSpace = ({ doc, needPx, size, margins, onNewPage }: { doc: PDFDoc, needPx: number, size: number[], margins: { top: number, bottom: number, left: number, right: number }, onNewPage?: () => void }) => {
    const pageBottom = doc.page.height - doc.page.margins.bottom
    if (doc.y + needPx > pageBottom) {
      doc.addPage({ size, margins })
      if (onNewPage)
        onNewPage()
    }
  }

  const renderTableHeader = (doc: PDFDoc) => {
    doc.fontSize(10).font('Manrope-Bold')
    drawTableRow(doc, Object.values(tableColumns).map(column => ({
      ...column,
      value: column.key,
    })))
    drawHr(doc, 8, 8)
    doc.font('Manrope')
  }

  const doc = new PDFDocument({ autoFirstPage: false })

  doc.addPage({ size: config.size, margins: config.margins })

  doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
  doc.registerFont('Manrope-Bold', path.resolve(__dirname, '../utils/fonts/Manrope-ExtraBold.ttf'))

  doc.fontSize(32)
  doc.font('Manrope-Bold')
  doc.image(
    path.resolve(__dirname, '../utils/invoice/logo.png'),
    config.margins.left,
    doc.y,
    { width: 141.67, height: 50 },
  )
  doc.text(
    `Draft invoice`,
    config.margins.left,
    doc.y,
    { width: config.contentWidth, height: 25, align: 'right', ellipsis: true, lineBreak: false },
  )

  drawHr(doc, 8, 8)

  // INVOICE DATE

  const fmt = new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  doc.fontSize(12)
  doc.font('Manrope-Bold')
  doc.text(
    'Invoice date:',
    config.margins.left,
    doc.y,
  )
  doc.fontSize(10)
  doc.font('Manrope')
  doc.text(
    `${fmt.format(new Date())}`,
    config.margins.left,
    doc.y,
  )
  doc.font('Manrope-Bold')

  drawHr(doc, 8, 8)

  // INVOICE DATE

  // PRODUCTS

  function getProductPrice(lengthCm: number, type: any[]): number | null {
    let table = [
      { min: 40, max: 44, price: 900 },
      { min: 45, max: 49, price: 950 },
      { min: 50, max: 54, price: 1000 },
      { min: 55, max: 59, price: 1150 },
      { min: 60, max: 64, price: 1200 },
      { min: 65, max: 69, price: 1250 },
      { min: 70, max: 74, price: 1300 },
      { min: 75, max: 79, price: 1350 },
      { min: 80, max: 84, price: 1400 },
      { min: 85, max: 89, price: 1500 },
      { min: 90, max: 94, price: 1600 },
      { min: 95, max: 99, price: 1700 },
      { min: 100, max: 104, price: 1800 },
      { min: 105, max: 109, price: 1900 },
      { min: 110, max: 114, price: 2000 },
    ]

    let multiply = 1

    if (type.includes(hairTypes.CURLY)) {
      multiply = 1.3
    }

    if (type.includes(hairTypes.VIRGIN)) {
      table = [
        { min: 40, max: 44, price: 1800 },
        { min: 45, max: 49, price: 1900 },
        { min: 50, max: 54, price: 2000 },
        { min: 55, max: 59, price: 2100 },
        { min: 60, max: 64, price: 2200 },
        { min: 65, max: 69, price: 2300 },
        { min: 70, max: 74, price: 2400 },
        { min: 75, max: 79, price: 2500 },
        { min: 80, max: 84, price: 2600 },
        { min: 85, max: 89, price: 2700 },
        { min: 90, max: 94, price: 2800 },
        { min: 95, max: 99, price: 2900 },
        { min: 100, max: 104, price: 3000 },
        { min: 105, max: 109, price: 3100 },
        { min: 110, max: 114, price: 3200 },
      ]
    }

    if (type.includes(hairTypes.SLAVIC)) {
      table = [
        { min: 40, max: 44, price: 3600 },
        { min: 45, max: 49, price: 3700 },
        { min: 50, max: 54, price: 4800 },
        { min: 55, max: 59, price: 4900 },
        { min: 60, max: 64, price: 4000 },
        { min: 65, max: 69, price: 4100 },
        { min: 70, max: 74, price: 4200 },
        { min: 75, max: 79, price: 4300 },
        { min: 80, max: 84, price: 4400 },
        { min: 85, max: 89, price: 4500 },
        { min: 90, max: 94, price: 4600 },
        { min: 95, max: 99, price: 4700 },
        { min: 100, max: 104, price: 4800 },
        { min: 105, max: 109, price: 4900 },
        { min: 110, max: 114, price: 5000 },
      ]
      multiply = 1
    }

    if (type.includes(hairTypes.SILKY) || type.includes(hairTypes.BROWN)) {
      table = [
        { min: 40, max: 44, price: 1300 },
        { min: 45, max: 49, price: 1400 },
        { min: 50, max: 54, price: 1500 },
        { min: 55, max: 59, price: 1600 },
        { min: 60, max: 64, price: 1700 },
        { min: 65, max: 69, price: 1800 },
        { min: 70, max: 74, price: 1900 },
        { min: 75, max: 79, price: 2000 },
        { min: 80, max: 84, price: 2100 },
        { min: 85, max: 89, price: 2200 },
        { min: 90, max: 94, price: 2300 },
        { min: 95, max: 99, price: 2400 },
        { min: 100, max: 104, price: 2500 },
      ]
    }

    for (const row of table) {
      if (lengthCm >= row.min && lengthCm <= row.max) {
        return row.price * multiply
      }
    }
    return null
  }

  // function getNewProductPrice(weightGrams: number, packPrice: number) {
  //   return Math.round((packPrice * 1000) / weightGrams)
  // }

  const invoiceItems = items.map((item) => {
    if (item === null)
      return null

    const type = item.productProperties.find(property => property.id === propertyIds.HAIR_TYPE)
    const weight = item.productProperties.find(property => property.id === propertyIds.WEIGHT)
    const length = item.productProperties.find(property => property.id === propertyIds.LENGTH)
    const discount = item.discountAmount > 0 ? item.discountAmount * item.quantity : item.discountPercent > 0 ? item.discountPercent : 0
    const discountType = item.discountAmount > 0 ? 'amount' : item.discountPercent > 0 ? 'percent' : 'none'

    if (!type || !weight || !length)
      return null

    return {
      name: item.names[language] ?? '',
      length: length.value as number,
      weight: weight.value as number,
      type: type?.options.map(option => option.names[language] ?? '').join(', ') || '',
      price: getProductPrice(length.value as number, type.options.map(option => option.id)),
      quantity: item.quantity,
      total: item.price * item.quantity,
      currency: item.currency,
      discount,
      discountType,
    }
  }).filter(p => p !== null).sort((a, b) => a.length - b.length)

  doc.fontSize(10)

  renderTableHeader(doc)

  const totals: { count: number, weight: number, amount: Record<string, { currency: string, total: number }> } = { count: 0, weight: 0, amount: {} }
  for (const item of invoiceItems) {
    doc.font('Manrope')
    doc.fontSize(10)
    const row = [
      {
        ...tableColumns.name,
        value: item.name,
      },
      {
        ...tableColumns.length,
        value: `${item.length} cm`,
      },
      {
        ...tableColumns.weight,
        value: `${item.weight} g`,
      },
      {
        ...tableColumns.type,
        value: `${item.type}`,
      },
      {
        ...tableColumns.price,
        value: `${item.price}`,
      },
      {
        ...tableColumns.quantity,
        value: `${item.quantity} pcs`,
      },
      ...(hasDiscount ? [{ ...tableColumns.discount, value: `${item.discount} ${item.discountType === 'amount' ? '' : '%'}` }] : []),
      {
        ...tableColumns.total,
        value: `${item.total.toFixed(0)}`,
      },
    ]

    const rowH = measureRowHeight({ doc, columns: row, options: { maxHeight: 70, minHeight: 22 } })
    const hrH = 12
    const needPx = rowH + hrH

    ensureSpace({ doc, needPx, size: config.size, margins: config.margins, onNewPage: () => renderTableHeader(doc) })

    totals.count += item.quantity
    totals.weight += item.weight
    if (totals.amount[item.currency] === undefined) {
      totals.amount[item.currency] = { currency: item.currency, total: 0 }
    }
    totals.amount[item.currency].total += item.total
    drawTableRow(doc, row)
    drawHr(doc, 8, 8)
  }

  const totalRow = [
    {
      ...tableColumns.name,
      value: '',
    },
    {
      ...tableColumns.length,
      value: '',
    },
    {
      ...tableColumns.weight,
      value: `${totals.weight} g`,
    },
    {
      ...tableColumns.type,
      value: '',
    },
    {
      ...tableColumns.price,
      value: ``,
    },
    {
      ...tableColumns.quantity,
      value: `${totals.count} pcs`,
    },
    ...(hasDiscount ? [{ ...tableColumns.discount, value: '' }] : []),
    {
      ...tableColumns.total,
      value: Object.values(totals.amount).map(amount => `${amount.total.toFixed(0)}`).join(', '),
    },
  ]

  doc.font('Manrope-Bold')
  drawTableRow(doc, totalRow)

  return {
    status: 'success',
    code: 'DRAFT_INVOICE_PRINTED',
    message: 'Draft invoice printed',
    doc: doc as unknown as PipeableDocument,
  }
}

export async function printOrderLabel({ payload }: { payload: PrintOrderLabelOrderPayload }): Promise<PrintOrderLabelOrderResponse> {
  const { seq } = payload

  const order = await OrderRepository.findOne({ payload: { seq } })

  if (!order)
    throw new HttpError(400, 'Order not found', 'ORDER_NOT_FOUND')

  const MM = 8.49
  const [wMm, hMm] = [55, 40]
  const paddingMm = 1.5

  const size: [number, number] = [wMm * MM, hMm * MM]
  const margins = {
    top: paddingMm * MM,
    left: paddingMm * MM,
    right: paddingMm * MM,
    bottom: paddingMm * MM,
  }

  const { invoiceAddition } = getHardcodeData()

  const doc = new PDFDocument({ autoFirstPage: false })

  doc.registerFont('Manrope', path.resolve(__dirname, '../utils/fonts/Manrope-Regular.ttf'))
  doc.registerFont('Manrope-Bold', path.resolve(__dirname, '../utils/fonts/Manrope-ExtraBold.ttf'))

  doc.addPage({ size, margins })

  if (order !== null) {
    doc.font('Manrope-Bold')
    doc.fontSize(70)
    doc.text(
      `#${order.seq + invoiceAddition}`,
      margins.left,
      doc.y - 15,
      { width: size[0] - margins.left - margins.right, height: 25, align: 'left' },
    )
  }

  if (order.client !== null) {
    doc.y -= 15
    doc.font('Manrope-Bold')
    doc.fontSize(28)
    doc.text(
      `${order.client.name ?? ''} ${order.client.lastName ?? ''} ${order.client.middleName ?? ''}`,
      margins.left,
      doc.y,
      { width: size[0] - margins.left - margins.right, height: 25, align: 'left' },
    )
    doc.text(
      `${order.client.phones !== undefined && order.client.phones.length > 0 ? order.client.phones.join(', ') : ''}`,
      margins.left,
      doc.y,
      { width: size[0] - margins.left - margins.right, height: 25, align: 'left' },
    )
    doc.text(
      `${order.client.emails !== undefined && order.client.emails.length > 0 ? order.client.emails.join(', ') : ''}`,
      margins.left,
      doc.y,
      { width: size[0] - margins.left - margins.right, height: 25, align: 'left' },
    )
  }

  drawHr(doc, margins, size)

  doc.text(
    `${order.comment || ''}`,
    margins.left,
    doc.y,
    { width: size[0] - margins.left - margins.right, align: 'left' },
  )

  return {
    status: 'success',
    code: 'ORDER_LABEL_PRINTED',
    message: 'Order label printed',
    doc: doc as unknown as PipeableDocument,
  }
}

async function convertCurrency({
  amount,
  fromCurrencyId,
  toCurrencyId,
}: {
  amount: number
  fromCurrencyId: string
  toCurrencyId: string
}): Promise<{ convertedAmount: number, rate: number }> {
  if (fromCurrencyId === toCurrencyId) {
    return { convertedAmount: amount, rate: 1 }
  }

  const { data: { items: exchangeRates } } = await ExchangeRateService.getExchangeRates({
    payload: {
      filters: { fromCurrency: fromCurrencyId, toCurrency: toCurrencyId },
      pagination: { current: 1, pageSize: 1, full: true },
      sorters: { createdAt: 'desc' },
    },
  })

  if (exchangeRates.length === 0)
    throw new Error(`Exchange rate not found from ${fromCurrencyId} to ${toCurrencyId}`)

  const rate = exchangeRates[0].rate

  return { convertedAmount: Number.parseFloat((amount * rate).toFixed(2)), rate }
}

async function calculateProfit({
  item,
  purchasePrice,
  purchaseCurrency,
}: {
  item: { price: number, currency: string }
  purchasePrice: number
  purchaseCurrency: string
}): Promise<{ profit: number, exchangeRate: number }> {
  const sellingCurrency = item.currency

  let convertedPurchasePrice = purchasePrice
  let exchangeRate = 1

  if (purchaseCurrency !== sellingCurrency) {
    const { convertedAmount, rate } = await convertCurrency({
      amount: purchasePrice,
      fromCurrencyId: purchaseCurrency,
      toCurrencyId: sellingCurrency,
    })

    convertedPurchasePrice = convertedAmount
    exchangeRate = rate
  }

  const profit = item.price - convertedPurchasePrice

  return { profit, exchangeRate }
}

async function computeOrderPaymentStatus(
  prices: { currency: string, totalMinor: number, scale: number, exchangeRateToCalculationCurrency?: number }[],
  payments: { currency: string, totalMinor: number, scale: number, exchangeRateToCalculationCurrency?: number }[],
  currencies: { id: string, scale: number, paymentEpsilon?: number | null }[],
) {
  const calculationCurrencyId = resolveCalculationCurrency(payments, prices)
  const calculationCurrencyDoc = currencies.find(c => c.id === calculationCurrencyId)

  if (!calculationCurrencyDoc)
    throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

  return getPaymentStatus(
    await withCalculationRates(prices, calculationCurrencyId),
    await withCalculationRates(payments, calculationCurrencyId),
    buildCalculationCurrency(calculationCurrencyDoc),
  )
}

async function withCalculationRates(
  entries: { currency: string, totalMinor: number, scale: number, exchangeRateToCalculationCurrency?: number }[],
  calculationCurrencyId: string,
) {
  return Promise.all(entries.map(async (entry) => {
    if (entry.currency === calculationCurrencyId || entry.exchangeRateToCalculationCurrency !== undefined)
      return entry

    const major = entry.totalMinor / (10 ** entry.scale)
    const { rate } = await convertCurrency({
      amount: major,
      fromCurrencyId: entry.currency,
      toCurrencyId: calculationCurrencyId,
    })

    return { ...entry, exchangeRateToCalculationCurrency: rate }
  }))
}

async function applyItemsDiff(params: {
  orderId: string
  warehouseId: string
  items: {
    id?: string
    product: string
    quantity: number
    price: number
    currency: string
    basePrice: number
    manualPrice?: number
    discountAmount?: number
    discountPercent?: number
  }[]
  userId: string
  session: ClientSession
}) {
  const { orderId, warehouseId, items, userId, session } = params

  const order = await OrderRepository.findOne({ payload: { id: orderId } })

  const { items: currencies } = await CurrencyRepo.list(parseGetCurrency({ filters: { active: [true] } }))

  if (!order)
    throw new HttpError(400, 'Order not found', 'ORDER_NOT_FOUND')

  const prevWarehouseId = order.warehouse.toString()
  const newWarehouseId = warehouseId.toString()

  const oldItems = await OrderRepository.listItems({
    payload: {
      filters: { order: [orderId] },
      pagination: { current: 1, pageSize: 1000, full: true },
      hasProfitPermission: false,
    },
  })

  const oldById = new Map(oldItems.items.map(i => [i._id.toString(), i]))

  for (const newItem of items) {
    if (newItem.id !== undefined && oldById.has(newItem.id)) {
      // ЕСЛИ ТОВАР УЖЕ БЫЛ В ЗАКАЗЕ
      const oldItem = oldById.get(newItem.id)!

      const oldQuantity = oldItem.quantity
      const newQuantity = newItem.quantity
      const deltaQuantity = newQuantity - oldQuantity

      if (prevWarehouseId === newWarehouseId) {
        if (deltaQuantity !== 0) {
          await QuantityService.count({
            payload: {
              mode: 'dec',
              productId: newItem.product,
              count: deltaQuantity,
              warehouse: newWarehouseId,
              userId,
              refType: 'order',
              refId: orderId,
            },
            session,
          })
        }
      }
      else {
        await QuantityService.count({
          payload: {
            mode: 'inc',
            productId: oldItem.product._id,
            count: oldQuantity,
            warehouse: prevWarehouseId,
            userId,
            refType: 'order',
            refId: orderId,
          },
          session,
        })

        await QuantityService.count({
          payload: {
            mode: 'dec',
            productId: newItem.product,
            count: newQuantity,
            warehouse: newWarehouseId,
            userId,
            refType: 'order',
            refId: orderId,
          },
          session,
        })
      }

      const product = await ProductsRepository.findById(newItem.product)

      if (!product)
        throw new HttpError(400, 'Product not found', 'PRODUCT_NOT_FOUND')

      const currency = currencies.find(c => c.id === newItem.currency)

      if (!currency)
        throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

      const { profit, exchangeRate } = await calculateProfit({
        item: {
          price: toMinor(newItem.price, currency.scale),
          currency: newItem.currency,
        },
        purchasePrice: product.minorPurchasePrice,
        purchaseCurrency: product.purchaseCurrencyId,
      })

      const oldItemObj = { ...oldItem }
      const newItemObj = {
        ...oldItemObj,
        product: newItem.product,
        quantity: newItem.quantity,
        minorBasePrice: toMinor(newItem.basePrice, currency.scale),
        minorManualPrice: toMinor(newItem.manualPrice ?? 0, currency.scale) ?? undefined,
        minorDiscountAmount: toMinor(newItem.discountAmount ?? 0, currency.scale) ?? undefined,
        discountPercent: newItem.discountPercent ?? undefined,
        minorPrice: toMinor(newItem.price, currency.scale),
        currency: newItem.currency,
        minorPurchasePrice: product.minorPurchasePrice,
        purchaseCurrency: product.purchaseCurrencyId,
        minorProfit: profit,
        exchangeRate,
      }

      // TEMPORARY FIX
      // const diff = getDifferenceDeep(oldItemObj, newItemObj)
      // console.log(JSON.stringify(diff, null, 2))

      // if ('_id' in diff || 'order' in diff || 'createdBy' in diff) {
      //   delete diff._id
      //   delete diff.order
      //   delete diff.createdBy
      // }

      // if (Object.keys(diff).length > 0 && oldItem._id !== undefined) {
      //   await OrderRepository.updateOneItem({
      //     payload: {
      //       id: oldItem._id,
      //       ...diff,
      //     },
      //     session,
      //   })
      // }

      await OrderRepository.updateOneItem({
        payload: {
          id: oldItem._id,
          ...newItemObj,
        },
        session,
      })

      oldById.delete(newItem.id)
    }
    else {
      // ЕСЛИ ТОВАР НЕ БЫЛ В ЗАКАЗЕ
      const product = await ProductsRepository.findById(newItem.product, session)

      if (!product)
        throw new HttpError(400, 'Product not found', 'PRODUCT_NOT_FOUND')

      const currency = currencies.find(c => c.id === newItem.currency)
      const purchaseCurrency = currencies.find(c => c.id === product.purchaseCurrencyId)

      if (!currency || !purchaseCurrency)
        throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

      const { profit, exchangeRate } = await calculateProfit({
        item: {
          price: toMinor(newItem.price, currency.scale),
          currency: newItem.currency,
        },
        purchasePrice: product.minorPurchasePrice,
        purchaseCurrency: product.purchaseCurrencyId,
      })

      await OrderRepository.createOneItem({
        payload: {
          product: newItem.product,
          quantity: newItem.quantity,
          minorManualPrice: toMinor(newItem.price, currency.scale),
          minorBasePrice: toMinor(newItem.basePrice, currency.scale),
          minorPrice: toMinor(newItem.price, currency.scale),
          minorPurchasePrice: toMinor(product.minorPurchasePrice, purchaseCurrency.scale),
          minorProfit: profit,
          minorDiscountAmount: newItem.discountAmount !== undefined ? toMinor(newItem.discountAmount, currency.scale) : 0,
          discountPercent: newItem.discountPercent,
          currency: newItem.currency,
          order: orderId,
          purchaseCurrency: product.purchaseCurrencyId,
          exchangeRate,
          createdBy: userId,
        },
        session,
      })

      await QuantityService.count({
        payload: {
          mode: 'dec',
          productId: newItem.product,
          count: newItem.quantity,
          warehouse: newWarehouseId,
          userId,
          refType: 'order',
          refId: orderId,
        },
        session,
      })
    }
  }

  for (const [, oldItem] of oldById) {
    await OrderRepository.updateOneItem({
      payload: {
        id: oldItem._id,
        removed: true,
        removedBy: userId,
      },
      session,
    })

    await QuantityService.count({
      payload: {
        mode: 'inc',
        productId: oldItem.product._id,
        count: oldItem.quantity,
        warehouse: prevWarehouseId,
        userId,
        refType: 'order',
        refId: orderId,
      },
      session,
    })
  }
}

async function applyPaymentsDiff(params: {
  orderId: string
  payments: {
    id?: string
    cashregister: string
    cashregisterAccount: string
    amount: number
    currency: string
  }[]
  userId: string
  session: ClientSession
}): Promise<string[]> {
  const { orderId, payments, userId, session } = params

  if (payments.length === 0)
    return []

  const oldPayments = await OrderRepository.listPayments({
    payload: parseGetOrderPayments({ filters: { order: [orderId] }, pagination: { full: true } }),
  })

  const oldById = new Map(oldPayments.items.map(p => [p.id, mapOrderPaymentPopulatedItem(p)]))

  const activePaymentIds: string[] = []

  for (const payment of payments) {
    if (payment.id !== undefined && oldById.has(payment.id)) {
      const oldPayment = oldById.get(payment.id)!

      const amountChanged = payment.amount !== oldPayment.amount
      const currencyChanged = payment.currency.toString() !== oldPayment.currency.toString()
      const accountChanged = payment.cashregisterAccount.toString() !== oldPayment.cashregisterAccount.toString()
      const cashregisterChanged = payment.cashregister.toString() !== oldPayment.cashregister.toString()

      // Если что-то важное изменилось — отменяем старый, создаём новый
      if (amountChanged || currencyChanged || accountChanged || cashregisterChanged) {
        // 1) отменяем старый платёж
        await OrderPaymentRepository.updateById({
          id: oldPayment.id,
          payload: {
            removed: true,
            removedBy: userId,
            paymentStatus: 'cancelled',
          },
          session,
        })

        await MoneyTransactionService.createTransaction({
          payload: {
            type: 'income',
            direction: 'out',
            accountId: oldPayment.cashregisterAccount.id,
            cashregisterId: oldPayment.cashregister.id,
            sourceModel: 'order',
            sourceId: orderId,
            currencyId: oldPayment.currency.id,
            amount: oldPayment.amount,
            description: `Cancelled payment for order ${orderId}`,
          },
          session,
        })

        // 2) создаём новый
        const currency = await CurrencyRepo.findOne({ _id: payment.currency })

        if (currency === null)
          throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

        const createdPaymentArr = await OrderPaymentRepository.createOne({
          payload: {
            orderId,
            createdBy: userId,
            paymentStatus: 'paid',
            paymentDate: new Date(),
            cashregisterId: payment.cashregister,
            cashregisterAccountId: payment.cashregisterAccount,
            minorAmount: toMinor(payment.amount, currency.scale),
            currencyId: payment.currency,
          },
          session,
        })

        const createdPayment = createdPaymentArr[0]
        activePaymentIds.push(createdPayment._id)

        await MoneyTransactionService.createTransaction({
          payload: {
            type: 'income',
            direction: 'in',
            accountId: payment.cashregisterAccount,
            cashregisterId: payment.cashregister,
            sourceModel: 'order',
            sourceId: orderId,
            currencyId: payment.currency,
            amount: payment.amount,
            description: `Payment for order ${orderId}`,
          },
          session,
        })
      }
      else {
        activePaymentIds.push(oldPayment.id.toString())
      }

      oldById.delete(payment.id)
    }
    else {
      const currency = await CurrencyRepo.findOne({ _id: payment.currency })

      if (currency === null)
        throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

      const createdPaymentArr = await OrderPaymentRepository.createOne({
        payload: {
          orderId,
          createdBy: userId,
          currencyId: payment.currency,
          paymentStatus: 'paid',
          paymentDate: new Date(),
          cashregisterId: payment.cashregister,
          cashregisterAccountId: payment.cashregisterAccount,
          minorAmount: toMinor(payment.amount, currency.scale),
        },
        session,
      })

      const createdPayment = createdPaymentArr[0]
      activePaymentIds.push(createdPayment._id)

      await MoneyTransactionService.createTransaction({
        payload: {
          type: 'income',
          direction: 'in',
          accountId: payment.cashregisterAccount,
          cashregisterId: payment.cashregister,
          sourceModel: 'order',
          sourceId: orderId,
          currencyId: payment.currency,
          amount: payment.amount,
          description: `Payment for order ${orderId}`,
        },
        session,
      })
    }
  }

  // Всё, что осталось в oldById — удалённые платежи
  for (const [, oldPayment] of oldById) {
    await OrderPaymentRepository.updateById({
      id: oldPayment.id,
      payload: {
        removed: true,
        removedBy: userId,
        paymentStatus: 'cancelled',
      },
      session,
    })

    await MoneyTransactionService.createTransaction({
      payload: {
        type: 'income',
        direction: 'out',
        accountId: oldPayment.cashregisterAccount.id,
        cashregisterId: oldPayment.cashregister.id,
        sourceModel: 'order',
        sourceId: orderId,
        currencyId: oldPayment.currency.id,
        amount: oldPayment.amount,
        description: `Cancelled payment for order ${orderId}`,
      },
      session,
    })
  }

  return activePaymentIds
}
