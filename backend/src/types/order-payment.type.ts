import type {
  OrderPaymentDTO,
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
  order: string
  cashregister: string
  cashregisterAccount: string
  amount: number
  currency: string
  paymentStatus: string
  paymentDate: Date
  transaction: string
  comment: string
  createdBy: string
  removedBy: string
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface OrderPaymentDBPopulated extends Omit<OrderPaymentDB, 'currency'> {
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

export type GetOrderPaymentsRepoPayload = GetOrderPaymentsPayload
export interface GetOrderPaymentsRepoResult { items: OrderPaymentDTO[], total: number, page: number, pageSize: number }

export type CreateOrderPaymentsRepoPayload = CreateOrderPaymentsPayload

export type EditOrderPaymentsRepoPayload = EditOrderPaymentsPayload
