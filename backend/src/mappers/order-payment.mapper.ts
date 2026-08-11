import type { OrderPaymentDTO } from '@remnant/shared'
import type { OrderPaymentDBPopulated } from '@/types'
import { fromMinor } from '@/utils/money'

export function mapOrderPaymentRepoToDTO(item: OrderPaymentDBPopulated): OrderPaymentDTO {
  const { minorAmount, currency } = item

  return {
    id: item._id,
    order: item.orderId,
    amount: Number.parseFloat(fromMinor(minorAmount, currency.scale)),
    cashregister: {
      id: item.cashregister.id,
      names: item.cashregister.names,
    },
    cashregisterAccount: {
      id: item.cashregisterAccount.id,
      names: item.cashregisterAccount.names,
    },
    currency: {
      id: currency.id,
      names: currency.names,
      symbols: currency.symbols,
      scale: currency.scale,
    },
    paymentDate: item.paymentDate,
    transaction: item.transactionId ?? undefined,
    comment: item.comment,
    createdBy: item.createdBy ?? undefined,
    removedBy: item.removedBy ?? undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

export function mapOrderPaymentToDTO(orderPayment: OrderPaymentDBPopulated): OrderPaymentDTO {
  return {
    id: orderPayment._id,
    order: orderPayment.orderId,
    cashregister: {
      id: orderPayment.cashregister.id,
      names: orderPayment.cashregister.names,
    },
    cashregisterAccount: {
      id: orderPayment.cashregisterAccount.id,
      names: orderPayment.cashregisterAccount.names,
    },
    amount: Number.parseFloat(fromMinor(orderPayment.minorAmount, orderPayment.currency.scale)),
    currency: {
      id: orderPayment.currency.id,
      names: orderPayment.currency.names,
      symbols: orderPayment.currency.symbols,
      scale: orderPayment.currency.scale,
    },
    paymentDate: orderPayment.paymentDate,
    transaction: orderPayment.transactionId ?? undefined,
    comment: orderPayment.comment,
    createdBy: orderPayment.createdBy ?? undefined,
    removedBy: orderPayment.removedBy ?? undefined,
    createdAt: orderPayment.createdAt,
    updatedAt: orderPayment.updatedAt,
  }
}
