import { z } from 'zod'
import { dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

export const getOrdersSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    seq: z.string().trim().optional(),
    warehouse: z.string().trim().optional(),
    deliveryService: z.string().trim().optional(),
    orderSource: z.string().trim().optional(),
    orderStatus: z.array(z.string().trim()).default([]),
    client: z.string().trim().optional(),
    comment: z.string().trim().optional(),
    createdBy: z.string().trim().optional(),
    confirmedBy: z.string().trim().optional(),
    removedBy: z.string().trim().optional(),
    removed: z.boolean().default(false),
    orderPayments: z.array(z.string().trim()).default([]),
    hasProfitPermission: z.boolean().optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    seq: sorterParamsSchema.optional(),
    warehouse: sorterParamsSchema.optional(),
    deliveryService: sorterParamsSchema.optional(),
    orderSource: sorterParamsSchema.optional(),
    orderStatus: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetOrdersRequest = z.input<typeof getOrdersSchema>

export const getOrderItemsSchema = z.object({
  filters: z.object({
    order: z.array(idSchema).optional(),
    showFullData: z.boolean().optional(),
  }).optional().default({}),
  sorters: z.object({
    seq: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetOrderItemsRequest = z.input<typeof getOrderItemsSchema>

export const createOrderSchema = z.object({
  warehouse: z.string(),
  deliveryService: z.string(),
  orderSource: z.string(),
  orderStatus: z.string(),
  orderPayments: z.array(z.object({
    amount: z.number(),
    currency: z.string(),
    cashregister: z.string(),
    cashregisterAccount: z.string(),
    paymentStatus: z.string(),
    paymentDate: z.string().optional(),
    comment: z.string().optional(),
  }).optional()),
  client: z.string().optional(),
  comment: z.string().optional(),
  items: z.array(z.object({
    product: z.string(),
    quantity: z.number(),
    price: z.number(),
    manualPrice: z.number().optional(),
    basePrice: z.number(),
    currency: z.string(),
    discountAmount: z.number().optional(),
    discountPercent: z.number().optional(),
  })),
})

export type CreateOrderRequest = z.input<typeof createOrderSchema>

export const editOrderSchema = z.object({
  id: idSchema,
  warehouse: z.string(),
  deliveryService: z.string(),
  orderSource: z.string(),
  orderStatus: z.string(),
  orderPayments: z.array(z.object({
    id: z.string().optional(),
    amount: z.number(),
    currency: z.string(),
    cashregister: z.string(),
    cashregisterAccount: z.string(),
    paymentStatus: z.string(),
    paymentDate: z.string().optional(),
    comment: z.string().optional(),
  }).optional()),
  client: z.string().optional(),
  comment: z.string().optional(),
  items: z.array(z.object({
    id: z.string().optional(),
    product: z.string(),
    quantity: z.number(),
    price: z.number(),
    manualPrice: z.number().optional(),
    basePrice: z.number(),
    currency: z.string(),
    discountAmount: z.number().optional(),
    discountPercent: z.number().optional(),
  })),
})

export type EditOrderRequest = z.input<typeof editOrderSchema>

export const removeOrdersSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveOrdersRequest = z.input<typeof removeOrdersSchema>

export const printInvoiceOrderSchema = z.object({
  seq: numberFromStringSchema,
  language: z.string().optional().default('en'),
})

export type PrintInvoiceOrderRequest = z.input<typeof printInvoiceOrderSchema>

export const printDraftInvoiceOrderSchema = z.object({
  items: z.array(z.object({
    id: idSchema,
    names: z.record(z.string(), z.string()),
    quantity: z.number(),
    productProperties: z.array(z.object({
      id: idSchema,
      names: z.record(z.string(), z.string()),
      options: z.array(z.object({
        id: idSchema,
        names: z.record(z.string(), z.string()),
      })),
      value: z.unknown(),
    })),
    currency: z.object({
      id: z.string(),
      symbols: z.record(z.string(), z.string()),
    }),
    price: z.number(),
    manualPrice: z.number().optional(),
    basePrice: z.number(),
    discountAmount: z.number().optional().default(0),
    discountPercent: z.number().optional().default(0),
  })),
  language: z.string().optional().default('en'),
})

export type PrintDraftInvoiceOrderRequest = z.input<typeof printDraftInvoiceOrderSchema>

export const printOrderLabelOrderSchema = z.object({
  seq: numberFromStringSchema,
  language: z.string().optional().default('en'),
})

export type PrintOrderLabelOrderRequest = z.input<typeof printOrderLabelOrderSchema>
