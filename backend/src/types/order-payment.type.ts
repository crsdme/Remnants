import type {
  OrderPaymentDTOPopulated,
} from '@remnant/shared'
import type { z } from 'zod'
import type { CurrencyDB } from '@/types'
import {
  createOrderPaymentSchema,
  editOrderPaymentSchema,
  getOrderPaymentsSchema,
  removeOrderPaymentsSchema,
} from '@remnant/shared'

export interface OrderPaymentDB {
  _id: string
  orderId: string
  cashregisterId: string
  cashregisterAccountId: string
  minorAmount: number
  currencyId: string
  paymentStatus: string
  paymentDate: Date
  transactionId: string
  comment: string
  createdBy: string
  removedBy: string
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export type OrderPaymentDBPopulated
  = Omit<OrderPaymentDB, 'currencyId'> & {
    currency: CurrencyDB
  }

export type GetOrderPaymentsPayload = z.output<typeof getOrderPaymentsSchema>
export function parseGetOrderPayments(x: unknown): GetOrderPaymentsPayload {
  return (getOrderPaymentsSchema as z.ZodType<GetOrderPaymentsPayload>).parse(x)
}

export type CreateOrderPaymentsPayload = z.output<typeof createOrderPaymentSchema>
export function parseCreateOrderPayments(x: unknown): CreateOrderPaymentsPayload {
  return createOrderPaymentSchema.parse(x)
}

export type EditOrderPaymentsPayload = z.output<typeof editOrderPaymentSchema>
export function parseEditOrderPayments(x: unknown): EditOrderPaymentsPayload {
  return editOrderPaymentSchema.parse(x)
}

export type RemoveOrderPaymentsPayload = z.output<typeof removeOrderPaymentsSchema>
export function parseRemoveOrderPayments(x: unknown): RemoveOrderPaymentsPayload {
  return removeOrderPaymentsSchema.parse(x)
}

export interface OrderPaymentPopulatedRepoItem extends Omit<OrderPaymentDTOPopulated, 'amount' | 'currency'> {
  minorAmount: number
  currency: {
    id: string
    names: OrderPaymentDTOPopulated['currency']['names']
    symbols: OrderPaymentDTOPopulated['currency']['symbols']
    scale: number
    paymentEpsilon?: number
  }
}

export type GetOrderPaymentsRepoPayload = GetOrderPaymentsPayload
export interface GetOrderPaymentsRepoResult { items: OrderPaymentPopulatedRepoItem[], total: number, page: number, pageSize: number }

export interface CreateOrderPaymentsRepoPayload extends Omit<CreateOrderPaymentsPayload, 'amount'> {
  minorAmount: number
}

export interface EditOrderPaymentsRepoPayload {
  orderId?: string
  cashregisterId?: string
  cashregisterAccountId?: string
  minorAmount?: number
  currencyId?: string
  paymentStatus?: string
  paymentDate?: Date
  comment?: string
  removed?: boolean
  removedBy?: string
}
