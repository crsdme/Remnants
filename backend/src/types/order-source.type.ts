import type {
  OrderSourceDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import type { orderSourceDBSchema } from '../schemas'
import {
  createOrderSourceSchema,
  editOrderSourceSchema,
  getOrderSourcesSchema,
  removeOrderSourcesSchema,
} from '@remnant/shared'

export type OrderSourceDB = z.infer<typeof orderSourceDBSchema>

export type GetOrderSourcesPayload = z.output<typeof getOrderSourcesSchema>
export function parseGetOrderSources(x: unknown): GetOrderSourcesPayload {
  return getOrderSourcesSchema.parse(x)
}

export type CreateOrderSourcePayload = z.output<typeof createOrderSourceSchema>
export function parseCreateOrderSource(x: unknown): CreateOrderSourcePayload {
  return createOrderSourceSchema.parse(x)
}

export type EditOrderSourcePayload = z.output<typeof editOrderSourceSchema>
export function parseEditOrderSource(x: unknown): EditOrderSourcePayload {
  return editOrderSourceSchema.parse(x)
}

export type RemoveOrderSourcesPayload = z.output<typeof removeOrderSourcesSchema>
export function parseRemoveOrderSources(x: unknown): RemoveOrderSourcesPayload {
  return removeOrderSourcesSchema.parse(x)
}

export type GetOrderSourcesRepoPayload = GetOrderSourcesPayload
export interface GetOrderSourcesRepoResult { items: OrderSourceDTO[], total: number, page: number, pageSize: number }

export type CreateOrderSourceRepoPayload = CreateOrderSourcePayload

export type EditOrderSourceRepoPayload = EditOrderSourcePayload
