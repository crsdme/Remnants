import type { PipeableDocument } from '..'
import { z } from 'zod'
import { clientSchema } from './client.schema'
import { dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'
import { currencySchema } from './currency.schema'
import { deliveryServiceSchema } from './delivery-service.schema'
import { orderPaymentDTOPopulatedSchema, orderPaymentSchema } from './order-payment.schema'
import { orderSourceSchema } from './order-source.schema'
import { orderStatusSchema } from './order-status.schema'
import { productSchemaPopulated } from './product.schema'
import { warehouseSchema } from './warehouse.schema'

export const orderSchema = z.object({
  id: idSchema,
  seq: z.number(),
  warehouse: idSchema,
  deliveryService: idSchema,
  orderSource: idSchema,
  orderStatus: idSchema,
  orderPayments: z.array(idSchema),
  totals: z.array(z.object({
    currency: idSchema,
    total: z.number(),
  })),
  profit: z.array(z.object({
    currency: idSchema,
    total: z.number(),
  })),
  orderPaymentStatus: z.string(),
  client: idSchema,
  comment: z.string().trim().optional(),
  createdBy: idSchema,
  confirmedBy: idSchema,
  removedBy: idSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type OrderDTO = z.infer<typeof orderSchema>

export const orderDTOPopulatedSchema = orderSchema.omit({
  removedBy: true,
  createdBy: true,
  confirmedBy: true,
}).extend({
  warehouse: warehouseSchema,
  deliveryService: deliveryServiceSchema,
  orderSource: orderSourceSchema,
  orderStatus: orderStatusSchema,
  orderPayments: orderPaymentSchema,
  client: clientSchema,
})

export type OrderDTOPopulated = z.infer<typeof orderDTOPopulatedSchema>

export const orderItemSchema = z.object({
  id: idSchema,
  order: idSchema,
  product: idSchema,
  quantity: z.number(),
  price: z.number(),
  discountAmount: z.number(),
  discountPercent: z.number(),
  basePrice: z.number(),
  manualPrice: z.number(),
  currency: idSchema,
  removedBy: idSchema,
  removed: z.boolean().default(false),
  profit: z.number().optional(),
  exchangeRate: z.number().optional(),
  purchasePrice: z.number().optional(),
  purchaseCurrency: idSchema.optional(),
})
export type OrderItemDTO = z.infer<typeof orderItemSchema>

export const orderItemDTOPopulatedSchema = orderItemSchema.omit({
  removedBy: true,
  removed: true,
  currency: true,
  purchaseCurrency: true,
}).extend({
  product: productSchemaPopulated,
  currency: currencySchema,
  purchaseCurrency: currencySchema,
})

export type OrderItemDTOPopulated = z.infer<typeof orderItemDTOPopulatedSchema>

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
  include: z.object({
    items: z.boolean().optional().default(false),
  }).optional(),
  pagination: paginationSchema.optional().default({}),
})

export type GetOrdersRequest = z.input<typeof getOrdersSchema>

export const getOrderItemsSchema = z.object({
  filters: z.object({
    order: z.array(idSchema).optional(),
    showFullData: z.boolean().optional(),
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
    names: languageStringSchema,
    quantity: z.number(),
    productProperties: z.array(z.object({
      id: idSchema,
      names: languageStringSchema,
      options: z.array(z.object({
        id: idSchema,
        names: languageStringSchema,
      })),
      value: z.unknown(),
    })),
    currency: z.string(),
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

export const getOrderDetailsSchema = z.object({
  seq: numberFromStringSchema,
})

export type GetOrderDetailsRequest = z.input<typeof getOrderDetailsSchema>

export type PrintOrderLabelOrderRequest = z.input<typeof printOrderLabelOrderSchema>

export const getOrdersResponseSchema = responseListSchema(orderDTOPopulatedSchema)
export type GetOrdersResponse = z.infer<typeof getOrdersResponseSchema>

export const createOrderResponseSchema = responseItemSchema(orderSchema)
export type CreateOrderResponse = z.infer<typeof createOrderResponseSchema>

export const editOrderResponseSchema = responseItemSchema(orderSchema)
export type EditOrderResponse = z.infer<typeof editOrderResponseSchema>

export const removeOrdersResponseSchema = responseSchema
export type RemoveOrdersResponse = z.infer<typeof removeOrdersResponseSchema>

export const getOrderItemsResponseSchema = responseListSchema(orderItemDTOPopulatedSchema)
export type GetOrderItemsResponse = z.infer<typeof getOrderItemsResponseSchema>

export const payOrderResponseSchema = responseSchema
export type PayOrderResponse = z.infer<typeof payOrderResponseSchema>

export const printInvoiceOrderResponseSchema = responseSchema
export type PrintInvoiceOrderResponse = z.infer<typeof printInvoiceOrderResponseSchema> & { doc: PipeableDocument }

export const printDraftInvoiceOrderResponseSchema = responseSchema
export type PrintDraftInvoiceOrderResponse = z.infer<typeof printDraftInvoiceOrderResponseSchema> & { doc: PipeableDocument }

export const printOrderLabelOrderResponseSchema = responseSchema
export type PrintOrderLabelOrderResponse = z.infer<typeof printOrderLabelOrderResponseSchema> & { doc: PipeableDocument }

export const getOrderDetailsResponseSchema = responseSchema.extend({
  data: z.object({
    order: orderDTOPopulatedSchema,
    items: z.array(orderItemDTOPopulatedSchema),
    payments: z.array(orderPaymentDTOPopulatedSchema),
  }),
})
export type GetOrderDetailsResponse = z.infer<typeof getOrderDetailsResponseSchema>
