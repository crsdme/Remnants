import type {
  getOrderDetailsSchema,
  OrderDTOPopulated,
  OrderItemDTOPopulated,
  Replace,
} from '@remnant/shared'
import type { ClientSession } from 'mongoose'
import type { z } from 'zod'
import type { editOrderItemRepoSchema } from '@/schemas'
import type {
  ClientDB,
  CurrencyDB,
  DeliveryServiceDB,
  OrderPaymentDB,
  OrderSourceDB,
  OrderStatusDB,
  ProductDB,
  WarehouseDB,
} from '@/types'
import {
  createOrderItemSchema,
  createOrderSchema,
  editOrderSchema,
  getOrderItemsSchema,
  getOrdersSchema,
  printDraftInvoiceOrderSchema,
  printInvoiceOrderSchema,
  printOrderLabelOrderSchema,
  removeOrdersSchema,
} from '@remnant/shared'
import {
  createOrderRepoSchema,
  editOrderRepoSchema,
} from '@/schemas'

export interface OrderDB {
  _id: string
  seq: number
  warehouse: string
  deliveryService: string
  orderSource: string
  orderStatus: string
  orderPayments: string[]
  totals: {
    currency: string
    total: number
  }[]
  client: string
  comment: string
  createdBy: string
  confirmedBy: string
  removedBy: string
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface OrderItemDB {
  _id: string
  seq: number
  order: string
  product: string
  quantity: number
  price: number
}

export type OrderDBPopulated = Replace<
  OrderDB,
  {
    warehouse: WarehouseDB
    deliveryService: DeliveryServiceDB
    orderSource: OrderSourceDB
    orderStatus: OrderStatusDB
    orderPayments: OrderPaymentDB[]
    client: ClientDB
  }
>

export type OrderItemDBPopulated = Replace<
  OrderItemDB,
  {
    product: ProductDB
    currency: CurrencyDB
    purchaseCurrency: CurrencyDB
  }
>

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
export function parseCreateOrder(x: unknown): CreateOrderPayload {
  return createOrderSchema.parse(x)
}

export type CreateOrderItemPayload = z.output<typeof createOrderItemSchema>
export function parseCreateOrderItem(x: unknown): CreateOrderItemPayload {
  return (createOrderItemSchema as z.ZodType<CreateOrderItemPayload>).parse(x)
}

export type EditOrderPayload = z.output<typeof editOrderSchema>
export function parseEditOrder(x: unknown): EditOrderPayload {
  return editOrderSchema.parse(x)
}

export type RemoveOrdersPayload = z.output<typeof removeOrdersSchema>
export function parseRemoveOrders(x: unknown): RemoveOrdersPayload {
  return removeOrdersSchema.parse(x)
}

export type GetOrdersRepoPayload = GetOrdersPayload & { hasProfitPermission: boolean }
export interface GetOrdersRepoResult { items: OrderDTOPopulated[], total: number, page: number, pageSize: number }

export type GetOrderItemsRepoPayload = GetOrderItemsPayload & { hasProfitPermission: boolean, session?: ClientSession }
export interface GetOrderItemsRepoResult { items: OrderItemDTOPopulated[], total: number, page: number, pageSize: number }

export type CreateOrderRepoPayload = z.output<typeof createOrderRepoSchema>
export function parseCreateOrderRepo(x: unknown): CreateOrderRepoPayload {
  return createOrderRepoSchema.parse(x)
}

export type CreateOrderItemRepoPayload = CreateOrderItemPayload

export type EditOrderItemRepoPayload = z.output<typeof editOrderItemRepoSchema>

export type EditOrderRepoPayload = z.output<typeof editOrderRepoSchema>
export function parseEditOrderRepo(x: unknown): EditOrderRepoPayload {
  return editOrderRepoSchema.parse(x)
}

export type PrintInvoiceOrderPayload = z.output<typeof printInvoiceOrderSchema>
export function parsePrintInvoiceOrder(x: unknown): PrintInvoiceOrderPayload {
  return printInvoiceOrderSchema.parse(x)
}

export type PrintDraftInvoiceOrderPayload = z.output<typeof printDraftInvoiceOrderSchema>
export function parsePrintDraftInvoiceOrder(x: unknown): PrintDraftInvoiceOrderPayload {
  return printDraftInvoiceOrderSchema.parse(x)
}

export type PrintOrderLabelOrderPayload = z.output<typeof printOrderLabelOrderSchema>
export function parsePrintOrderLabelOrder(x: unknown): PrintOrderLabelOrderPayload {
  return printOrderLabelOrderSchema.parse(x)
}

export interface PayOrderPayload { id: string }

export interface FindOneOrderRepoPayload { id?: string, seq?: number }
