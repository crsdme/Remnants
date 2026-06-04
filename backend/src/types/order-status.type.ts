import type {
  LanguageString,
  OrderStatusDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import {
  createOrderStatusSchema,
  editOrderStatusSchema,
  getOrderStatusesSchema,
  removeOrderStatusesSchema,
} from '@remnant/shared'

export interface OrderStatusDB {
  _id: string
  names: LanguageString
  priority: number
  color: string
  removed: boolean
  isLocked: boolean
  isSelectable: boolean
  createdBy: string
  removedBy: string
  createdAt: Date
  updatedAt: Date
}

export type GetOrderStatusesPayload = z.output<typeof getOrderStatusesSchema>
export function parseGetOrderStatuses(x: unknown): GetOrderStatusesPayload {
  return getOrderStatusesSchema.parse(x)
}

export type CreateOrderStatusPayload = z.output<typeof createOrderStatusSchema>
export function parseCreateOrderStatus(x: unknown): CreateOrderStatusPayload {
  return createOrderStatusSchema.parse(x)
}

export type EditOrderStatusPayload = z.output<typeof editOrderStatusSchema>
export function parseEditOrderStatus(x: unknown): EditOrderStatusPayload {
  return editOrderStatusSchema.parse(x)
}

export type RemoveOrderStatusesPayload = z.output<typeof removeOrderStatusesSchema>
export function parseRemoveOrderStatuses(x: unknown): RemoveOrderStatusesPayload {
  return removeOrderStatusesSchema.parse(x)
}

export type GetOrderStatusesRepoPayload = GetOrderStatusesPayload
export interface GetOrderStatusesRepoResult { items: OrderStatusDTO[], total: number, page: number, pageSize: number }

export type CreateOrderStatusRepoPayload = CreateOrderStatusPayload

export type EditOrderStatusRepoPayload = EditOrderStatusPayload
