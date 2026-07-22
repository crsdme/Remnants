import type { z } from 'zod'
import type {
  createOrderPaymentRepoSchema,
  editOrderPaymentRepoSchema,
  orderPaymentDBPopulatedSchema,
  orderPaymentDBSchema,
  orderPaymentPopulatedRepoItemSchema,
} from '@/schemas/order-payment.schema'
import {
  createOrderPaymentSchema,
  editOrderPaymentSchema,
  getOrderPaymentsSchema,
  removeOrderPaymentsSchema,
} from '@remnant/shared'

export type OrderPaymentDB = z.infer<typeof orderPaymentDBSchema>

export type OrderPaymentDBPopulated = z.infer<typeof orderPaymentDBPopulatedSchema>

export type OrderPaymentPopulatedRepoItem = z.infer<typeof orderPaymentPopulatedRepoItemSchema>

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
export interface GetOrderPaymentsRepoResult { items: OrderPaymentPopulatedRepoItem[], total: number, page: number, pageSize: number }

export type CreateOrderPaymentsRepoPayload = z.infer<typeof createOrderPaymentRepoSchema>

export type EditOrderPaymentsRepoPayload = z.infer<typeof editOrderPaymentRepoSchema>
