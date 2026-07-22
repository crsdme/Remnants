import type { OrderDTOPopulated, OrderItemDTOPopulated } from '@remnant/shared'
import type { OrderDBPopulated, OrderItemDBPopulated } from '@/types'
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
    },
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
    orderPayments: order.orderPayments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      paymentStatus: payment.paymentStatus,
      paymentDate: payment.paymentDate,
      comment: payment.comment,
    })),
    totals: order.totals.map(total => ({
      currency: total.currency,
      total: Number.parseFloat(fromMinor(total.total, total.scale)),
    })),
    comment: order.comment,
    profit: order.profit.map(profit => ({
      currency: profit.currency,
      total: Number.parseFloat(fromMinor(profit.total, profit.scale)),
    })),
    orderPaymentStatus: order.orderPaymentStatus,
    client: {
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
    },
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }
}

export function mapOrderItemPopulatedToDTO(order: OrderItemDBPopulated): OrderItemDTOPopulated {
  return {
    id: order._id,
    order: order.order,
    product: {
      id: order.product._id,
      seq: order.product.seq,
      names: order.product.names,
      price: Number.parseFloat(fromMinor(order.product.minorPrice, order.product.currency.scale)),
      currency: order.product.currency,
      purchasePrice: Number.parseFloat(fromMinor(order.product.minorPurchasePrice, order.product.purchaseCurrency.scale)),
      purchaseCurrency: order.product.purchaseCurrency,
      barcodes: order.product.barcodes,
      categories: order.product.categories,
      unit: order.product.unit,
      images: order.product.images,
      productPropertiesGroup: order.product.productPropertiesGroup,
      productProperties: order.product.productProperties.map(({ id, ...item }) => ({
        id,
        ...item,
      })),
      warehouseStock: order.product.warehouseStock,
      createdAt: order.product.createdAt,
      updatedAt: order.product.updatedAt,
    },
    quantity: order.quantity,
    price: Number.parseFloat(fromMinor(order.minorPrice, order.currency.scale)),
    manualPrice: Number.parseFloat(fromMinor(order.minorManualPrice, order.currency.scale)),
    discountAmount: Number.parseFloat(fromMinor(order.minorDiscountAmount, order.currency.scale)),
    discountPercent: order.discountPercent,
    basePrice: Number.parseFloat(fromMinor(order.minorBasePrice, order.currency.scale)),
    purchasePrice: Number.parseFloat(fromMinor(order.minorPurchasePrice, order.purchaseCurrency.scale)),
    profit: Number.parseFloat(fromMinor(order.minorProfit, order.currency.scale)),
    currency: {
      id: order.currency.id,
      names: order.currency.names,
      symbols: order.currency.symbols,
      scale: order.currency.scale,
    },
    purchaseCurrency: {
      id: order.purchaseCurrency.id,
      names: order.purchaseCurrency.names,
      symbols: order.purchaseCurrency.symbols,
      scale: order.purchaseCurrency.scale,
    },
  }
}
