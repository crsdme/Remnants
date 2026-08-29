import type { OrderDTOPopulated, OrderItemDTOPopulated } from '@remnant/shared'
import type { OrderDBPopulated, OrderItemDBPopulated } from '@/types'
import path from 'node:path'
import { toMinorType } from '@remnant/shared'
import { STORAGE_URLS } from '@/config'
import { fromMinor } from '@/utils/money'

export function mapOrderPopulatedToDTO(order: OrderDBPopulated): OrderDTOPopulated {
  return {
    id: order.id,
    seq: order.seq,
    warehouse: {
      id: order.warehouse.id,
      names: order.warehouse.names,
      priority: order.warehouse.priority,
    },
    deliveryService: {
      id: order.deliveryService.id,
      names: order.deliveryService.names,
      priority: order.deliveryService.priority,
      type: order.deliveryService.type,
      color: order.deliveryService.color,
    },
    delivery: order.delivery,
    orderSource: {
      id: order.orderSource.id,
      names: order.orderSource.names,
      priority: order.orderSource.priority,
    },
    orderStatus: {
      id: order.orderStatus.id,
      names: order.orderStatus.names,
      priority: order.orderStatus.priority,
      color: order.orderStatus.color,
      isLocked: order.orderStatus.isLocked,
    },
    orderPayments: (order.orderPayments ?? []).map(payment => ({
      id: payment.id,
      amount: Number.parseFloat(fromMinor(payment.minorAmount, payment.scale)),
      paymentDate: payment.paymentDate,
      comment: payment.comment,
    })),
    totals: (order.totals ?? []).map(total => ({
      currency: total.currency,
      total: Number.parseFloat(fromMinor(total.total, total.scale)),
    })),
    comment: order.comment,
    files: (order.files ?? []).map(file => ({
      id: path.parse(file.filename).name,
      path: `${STORAGE_URLS.orderFiles}/${file.filename}`,
      filename: file.filename,
      name: file.name,
      type: file.type,
    })),
    profit: (order.profit ?? []).map(profit => ({
      currency: profit.currency,
      total: Number.parseFloat(fromMinor(profit.total, profit.scale)),
    })),
    orderPaymentStatus: order.orderPaymentStatus,
    client: order.client
      ? {
          id: order.client.id,
          seq: order.client.seq,
          name: order.client.name,
          middleName: order.client.middleName,
          lastName: order.client.lastName,
          country: order.client.country,
          emails: order.client.emails,
          phones: order.client.phones,
          addresses: order.client.addresses,
          socials: order.client.socials,
          comment: order.client.comment,
        }
      : null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }
}

function currencyScale(currency?: { scale?: number } | null): number {
  const scale = currency?.scale
  return typeof scale === 'number' && Number.isFinite(scale) ? scale : 2
}

function mapCurrencyRef(
  currency?: { id?: string, names?: Record<string, string>, symbols?: Record<string, string>, scale?: number } | null,
  fallback?: { id?: string, names?: Record<string, string>, symbols?: Record<string, string>, scale?: number } | null,
) {
  const hasId = typeof currency?.id === 'string' && currency.id.length > 0
  const source = hasId ? currency : fallback
  return {
    id: source?.id ?? '',
    names: source?.names ?? {},
    symbols: source?.symbols ?? {},
    scale: currencyScale(source),
  }
}

export function mapOrderItemPopulatedToDTO(order: OrderItemDBPopulated): OrderItemDTOPopulated {
  const sellingCurrency = mapCurrencyRef(order.currency)
  const purchaseCurrency = mapCurrencyRef(order.purchaseCurrency, order.currency)
  const productSellingCurrency = mapCurrencyRef(order.product?.currency, order.currency)
  const productPurchaseCurrency = mapCurrencyRef(order.product?.purchaseCurrency, order.product?.currency ?? order.currency)
  const currencyScaleValue = sellingCurrency.scale
  const purchaseCurrencyScale = purchaseCurrency.scale
  const productCurrencyScale = productSellingCurrency.scale
  const productPurchaseCurrencyScale = productPurchaseCurrency.scale

  return {
    id: String(order._id),
    order: order.orderId,
    product: {
      id: order.product._id,
      seq: order.product.seq,
      names: order.product.names,
      price: Number.parseFloat(fromMinor(order.product.minorPrice, productCurrencyScale)),
      currency: productSellingCurrency,
      purchasePrice: Number.parseFloat(fromMinor(order.product.minorPurchasePrice ?? toMinorType(0), productPurchaseCurrencyScale)),
      purchaseCurrency: productPurchaseCurrency,
      barcodes: order.product.barcodes,
      categories: order.product.categories,
      unit: order.product.unit,
      images: order.product.images,
      productPropertiesGroup: order.product.productPropertiesGroup,
      productProperties: (order.product.productProperties ?? []).map(({ id, options, ...item }) => ({
        id,
        ...item,
        options: options ?? [],
      })),
      warehouseStock: order.product.warehouseStock,
      createdAt: order.product.createdAt,
      updatedAt: order.product.updatedAt,
    },
    quantity: order.quantity,
    price: Number.parseFloat(fromMinor(order.minorPrice, currencyScaleValue)),
    manualPrice: order.minorManualPrice != null
      ? Number.parseFloat(fromMinor(order.minorManualPrice, currencyScaleValue))
      : null,
    discountAmount: Number.parseFloat(fromMinor(order.minorDiscountAmount, currencyScaleValue)),
    discountPercent: order.discountPercent,
    basePrice: Number.parseFloat(fromMinor(order.minorBasePrice, currencyScaleValue)),
    purchasePrice: Number.parseFloat(fromMinor(order.minorPurchasePrice ?? toMinorType(0), purchaseCurrencyScale)),
    profit: Number.parseFloat(fromMinor(order.minorProfit ?? toMinorType(0), currencyScaleValue)),
    currency: sellingCurrency,
    purchaseCurrency,
  }
}
