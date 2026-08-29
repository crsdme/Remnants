import type {
  createOrderItemSchema,
  createOrderSchema,
  createOrderShipmentSchema,
  editOrderSchema,
  getOrderDetailsSchema,
  printDraftInvoiceOrderSchema,
  printInvoiceOrderSchema,
  printOrderLabelOrderSchema,
  printOrderShipmentLabelSchema,
  removeOrdersSchema,
  syncOrderShipmentsSchema,
} from '@remnant/shared'
import type { ClientSession } from 'mongoose'
import type { z } from 'zod'
import type {
  createOrderItemRepoSchema,
  createOrderRepoSchema,
  editOrderItemRepoSchema,
  editOrderRepoSchema,
  orderDBPopulatedSchema,
  orderDBSchema,
  orderItemDBPopulatedSchema,
  orderItemDBSchema,
} from '@/schemas'
import { getOrderItemsSchema, getOrdersSchema } from '@remnant/shared'

export type OrderDB = z.infer<typeof orderDBSchema>

export type OrderItemDB = z.infer<typeof orderItemDBSchema>

export type OrderItemDBPopulated = z.infer<typeof orderItemDBPopulatedSchema>

export type OrderDBPopulated = z.infer<typeof orderDBPopulatedSchema>

export type GetOrdersPayload = z.output<typeof getOrdersSchema>
export function parseGetOrders(x: unknown): GetOrdersPayload {
  return getOrdersSchema.parse(x)
}

export type GetOrderItemsPayload = z.output<typeof getOrderItemsSchema>
export function parseGetOrderItems(x: unknown): GetOrderItemsPayload {
  return getOrderItemsSchema.parse(x)
}
export type GetOrderDetailsPayload = z.output<typeof getOrderDetailsSchema>

export type CreateOrderPayload = z.output<typeof createOrderSchema>

export type CreateOrderItemPayload = z.output<typeof createOrderItemSchema>

export type EditOrderPayload = z.output<typeof editOrderSchema>

export type RemoveOrdersPayload = z.output<typeof removeOrdersSchema>

export type GetOrdersRepoPayload = GetOrdersPayload & { hasProfitPermission: boolean }
export interface GetOrdersRepoResult { items: OrderDBPopulated[], total: number, page: number, pageSize: number }

export type GetOrderItemsRepoPayload = GetOrderItemsPayload & { hasProfitPermission: boolean, session?: ClientSession }
export interface GetOrderItemsRepoResult { items: OrderItemDBPopulated[], total: number, page: number, pageSize: number }

export type CreateOrderRepoPayload = z.output<typeof createOrderRepoSchema>

export type CreateOrderItemRepoPayload = z.output<typeof createOrderItemRepoSchema>

export type EditOrderItemRepoPayload = z.output<typeof editOrderItemRepoSchema>

export type EditOrderRepoPayload = z.output<typeof editOrderRepoSchema>

export type PrintInvoiceOrderPayload = z.output<typeof printInvoiceOrderSchema>

export type PrintDraftInvoiceOrderPayload = z.output<typeof printDraftInvoiceOrderSchema>

export type PrintOrderLabelOrderPayload = z.output<typeof printOrderLabelOrderSchema>

export type CreateOrderShipmentPayload = z.output<typeof createOrderShipmentSchema>

export type PrintOrderShipmentLabelPayload = z.output<typeof printOrderShipmentLabelSchema>

export type SyncOrderShipmentsPayload = z.output<typeof syncOrderShipmentsSchema>

export interface PayOrderPayload { id: string }

export interface FindOneOrderRepoPayload { id?: string, seq?: number }
