import type { OrderPaymentDTO } from '@remnant/shared'
import type { OrderPaymentDBPopulated } from '@/types'

export function mapOrderPaymentToDTO(orderPayment: OrderPaymentDBPopulated): OrderPaymentDTO {
  return {
    id: orderPayment._id,
    order: orderPayment.order,
    cashregister: orderPayment.cashregister,
    cashregisterAccount: orderPayment.cashregisterAccount,
    amount: orderPayment.amount,
    currency: {
      id: orderPayment.currency._id,
      names: orderPayment.currency.names,
      symbols: orderPayment.currency.symbols,
      priority: orderPayment.currency.priority,
      active: orderPayment.currency.active,
      scale: orderPayment.currency.scale,
      createdAt: orderPayment.currency.createdAt,
      updatedAt: orderPayment.currency.updatedAt,
    },
    paymentStatus: orderPayment.paymentStatus,
    paymentDate: orderPayment.paymentDate,
    transaction: orderPayment.transaction,
    comment: orderPayment.comment,
    createdBy: orderPayment.createdBy,
    removedBy: orderPayment.removedBy,
    createdAt: orderPayment.createdAt,
    updatedAt: orderPayment.updatedAt,
  }
}
