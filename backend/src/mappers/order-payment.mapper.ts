import type { OrderPaymentDTO, OrderPaymentDTOPopulated } from '@remnant/shared'
import type { OrderPaymentDBPopulated, OrderPaymentPopulatedRepoItem } from '@/types'
import { fromMinor } from '@/utils/money'

export function mapOrderPaymentPopulatedItem(item: OrderPaymentPopulatedRepoItem): OrderPaymentDTOPopulated {
  const { minorAmount, currency, ...rest } = item

  return {
    ...rest,
    amount: Number.parseFloat(fromMinor(minorAmount, currency.scale)),
    currency: {
      id: currency.id,
      names: currency.names,
      symbols: currency.symbols,
      scale: currency.scale,
    },
  }
}

export function mapOrderPaymentToDTO(orderPayment: OrderPaymentDBPopulated): OrderPaymentDTO {
  return {
    id: orderPayment._id,
    order: orderPayment.orderId,
    cashregister: orderPayment.cashregisterId,
    cashregisterAccount: orderPayment.cashregisterAccountId,
    amount: Number.parseFloat(fromMinor(orderPayment.minorAmount, orderPayment.currency.scale)),
    currency: {
      id: orderPayment.currency._id,
      names: orderPayment.currency.names,
      symbols: orderPayment.currency.symbols,
      scale: orderPayment.currency.scale,
    },
    paymentStatus: orderPayment.paymentStatus,
    paymentDate: orderPayment.paymentDate,
    transaction: orderPayment.transactionId,
    comment: orderPayment.comment,
    createdBy: orderPayment.createdBy,
    removedBy: orderPayment.removedBy,
    createdAt: orderPayment.createdAt,
    updatedAt: orderPayment.updatedAt,
  }
}
