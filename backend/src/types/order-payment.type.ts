import type { z } from 'zod'
import type {
  orderPaymentDBPopulatedSchema,
} from '@/schemas/order-payment.schema'
import {
  getOrderPaymentsSchema,
} from '@remnant/shared'

export type OrderPaymentDBPopulated = z.infer<typeof orderPaymentDBPopulatedSchema>

export type GetOrderPaymentsPayload = z.output<typeof getOrderPaymentsSchema>
export function parseGetOrderPayments(x: unknown): GetOrderPaymentsPayload {
  return (getOrderPaymentsSchema as z.ZodType<GetOrderPaymentsPayload>).parse(x)
}

export type GetOrderPaymentsRepoPayload = GetOrderPaymentsPayload
export interface GetOrderPaymentsRepoResult {
  items: OrderPaymentDBPopulated[]
  total: number
  page: number
  pageSize: number
}
