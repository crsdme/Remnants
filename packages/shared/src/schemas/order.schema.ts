import type { PipeableDocument } from '..'
import { z } from 'zod'
import { dateRangeSchema, idSchema, languageCodeSchema, languageStringSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'
import { orderPaymentDTOPopulatedSchema } from './order-payment.schema'

export const orderSchema = z.object({
  id: idSchema,
  seq: z.number(),
  warehouse: idSchema,
  deliveryService: idSchema,
  orderSource: idSchema,
  orderStatus: idSchema,
  orderPayments: idSchema,
  totals: z.array(z.object({
    currency: idSchema,
    total: numberFromStringSchema,
  })),
  comment: z.string(),
  profit: z.array(z.object({
    currency: idSchema,
    total: numberFromStringSchema,
  })).optional(),
  orderPaymentStatus: z.enum(['paid', 'unpaid', 'partially_paid', 'overpaid']),
  client: idSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type OrderDTO = z.infer<typeof orderSchema>

export const orderDTOPopulatedSchema = orderSchema.omit({
  client: true,
  warehouse: true,
  deliveryService: true,
  orderSource: true,
  orderStatus: true,
  orderPayments: true,
}).extend({
  client: z.object({
    id: idSchema,
    seq: z.number(),
    name: z.string(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    country: z.string().optional(),
    emails: z.array(z.string().email()).optional(),
    phones: z.array(z.string().min(7)).optional(),
    addresses: z.array(z.string()).optional(),
    socials: z.array(z.object({
      type: z.string(),
      value: z.string(),
    })).optional(),
    comment: z.string().optional(),
  }),
  warehouse: z.object({
    id: idSchema,
    names: languageStringSchema,
    priority: numberFromStringSchema,
  }),
  deliveryService: z.object({
    id: idSchema,
    names: languageStringSchema,
    priority: numberFromStringSchema,
  }),
  orderSource: z.object({
    id: idSchema,
    names: languageStringSchema,
    priority: numberFromStringSchema,
  }),
  orderStatus: z.object({
    id: idSchema,
    names: languageStringSchema,
    priority: numberFromStringSchema,
    color: z.string().optional(),
    isLocked: z.boolean(),
  }),
  orderPayments: z.array(z.object({
    id: idSchema,
    amount: numberFromStringSchema,
    paymentStatus: z.enum(['paid', 'unpaid', 'partially_paid', 'overpaid']),
    paymentDate: z.coerce.date(),
    comment: z.string().optional(),
  })),
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
  profit: z.number().optional(),
  exchangeRate: z.number().optional(),
  purchasePrice: z.number().optional(),
  purchaseCurrency: idSchema.optional(),
})
export type OrderItemDTO = z.infer<typeof orderItemSchema>

export const orderItemDTOPopulatedSchema = orderItemSchema.omit({
  currency: true,
  purchaseCurrency: true,
  product: true,
}).extend({
  product: z.object({
    id: idSchema,
    seq: z.number(),
    names: languageStringSchema,
    price: numberFromStringSchema,
    purchasePrice: numberFromStringSchema,
    currency: z.object({
      id: idSchema,
      names: languageStringSchema,
      symbols: languageStringSchema,
      scale: numberFromStringSchema,
    }),
    purchaseCurrency: z.object({
      id: idSchema,
      names: languageStringSchema,
      symbols: languageStringSchema,
      scale: numberFromStringSchema,
    }),
    barcodes: z.array(z.object({
      code: z.string(),
      id: idSchema,
    })),
    categories: z.array(z.object({
      id: idSchema,
      names: languageStringSchema,
    })),
    unit: z.object({
      id: idSchema,
      names: languageStringSchema,
      symbols: languageStringSchema,
    }),
    productPropertiesGroup: z.object({
      id: idSchema,
      names: languageStringSchema,
    }),
    productProperties: z.array(z.object({
      id: idSchema,
      options: z.array(z.object({
        id: idSchema,
        names: languageStringSchema,
        color: z.string().optional(),
      })),
      value: z.unknown(),
      data: z.object({
        type: z.string(),
        names: languageStringSchema,
        showInTable: z.boolean(),
        isRequired: z.boolean(),
        symbols: languageStringSchema,
      }),
    })),
    warehouseStock: z.array(z.object({
      warehouse: idSchema,
      count: z.number(),
    })),
    images: z.array(z.object({
      filename: z.string(),
      name: z.string(),
      type: z.string(),
      path: z.string(),
    })),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
  currency: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: z.number(),
  }),
  purchaseCurrency: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: z.number(),
  }),
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
  language: languageCodeSchema.optional().default('en'),
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
  language: languageCodeSchema.optional().default('en'),
})

export type PrintDraftInvoiceOrderRequest = z.input<typeof printDraftInvoiceOrderSchema>

export const printOrderLabelOrderSchema = z.object({
  seq: numberFromStringSchema,
  language: languageCodeSchema.optional().default('en'),
})

export const getOrderDetailsSchema = z.object({
  seq: numberFromStringSchema,
})

export type GetOrderDetailsRequest = z.input<typeof getOrderDetailsSchema>

export type PrintOrderLabelOrderRequest = z.input<typeof printOrderLabelOrderSchema>

export const getOrdersResponseSchema = responseListSchema(orderDTOPopulatedSchema)
export type GetOrdersResponse = z.infer<typeof getOrdersResponseSchema>

export const createOrderResponseSchema = responseSchema
export type CreateOrderResponse = z.infer<typeof createOrderResponseSchema>

export const editOrderResponseSchema = responseSchema
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
