import type { PipeableDocument } from '..'
import { z } from 'zod'
import { dateRangeSchema, idSchema, idSchemaOptional, languageCodeSchema, languageStringSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'
import { deliveryCarrierTypeSchema, orderDeliveryFieldSchema, orderDeliverySchema } from './delivery-carrier.schema'
import { orderPaymentDTOPopulatedSchema } from './order-payment.schema'

const orderFileSchema = z.object({
  id: z.string(),
  filename: z.string(),
  name: z.string(),
  type: z.string(),
  path: z.string(),
})

const orderFileInputSchema = z.object({
  id: z.string().optional(),
  filename: z.string().optional().default(''),
  name: z.string(),
  type: z.string(),
  path: z.string().optional().default(''),
  isNew: z.boolean().optional().default(false),
})

const uploadedFilesIdsSchema = z.preprocess(
  (val) => {
    if (val === undefined || val === null || val === '')
      return undefined
    return Array.isArray(val) ? val : [val]
  },
  z.array(z.string()).optional(),
)

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
  delivery: orderDeliverySchema.optional(),
  files: z.array(orderFileSchema).optional().default([]),
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
  }).nullable().optional(),
  warehouse: z.object({
    id: idSchema,
    names: languageStringSchema,
    priority: numberFromStringSchema,
  }),
  deliveryService: z.object({
    id: idSchema,
    names: languageStringSchema,
    priority: numberFromStringSchema,
    type: deliveryCarrierTypeSchema.optional(),
    color: z.string().optional(),
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
    paymentDate: z.coerce.date(),
    comment: z.string().optional(),
  })),
  delivery: orderDeliverySchema.optional(),
})

export type OrderDTOPopulated = z.infer<typeof orderDTOPopulatedSchema>

export const orderItemSchema = z.object({
  // Legacy order-items used ObjectId; new ones use UUID.
  id: z.string().min(1),
  order: idSchema,
  product: idSchema,
  quantity: z.number(),
  price: z.number(),
  discountAmount: z.number(),
  discountPercent: z.number(),
  basePrice: z.number(),
  manualPrice: z.number().nullable(),
  currency: idSchema,
  profit: z.number().optional(),
  exchangeRate: z.number().optional(),
  purchasePrice: z.number().optional(),
  purchaseCurrency: idSchemaOptional,
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
      warehouseId: idSchema,
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
    warehouse: idSchemaOptional,
    deliveryService: idSchemaOptional,
    orderSource: idSchemaOptional,
    orderStatus: z.array(idSchema).default([]),
    client: idSchemaOptional,
    comment: z.string().trim().optional(),
    createdBy: idSchemaOptional,
    confirmedBy: idSchemaOptional,
    removedBy: idSchemaOptional,
    removed: z.boolean().default(false),
    orderPayments: z.array(idSchema).default([]),
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
  warehouse: idSchema,
  deliveryService: idSchema,
  orderSource: idSchema,
  orderStatus: idSchema,
  orderPayments: z.array(z.object({
    amount: z.number(),
    currency: idSchema,
    cashregister: idSchema,
    cashregisterAccount: idSchema,
    paymentDate: z.string().optional(),
    comment: z.string().optional(),
  }).optional()),
  client: idSchemaOptional,
  comment: z.string().optional(),
  delivery: orderDeliveryFieldSchema,
  files: z.array(orderFileInputSchema).optional().default([]),
  uploadedFilesIds: uploadedFilesIdsSchema,
  items: z.array(z.object({
    product: idSchema,
    quantity: z.number(),
    price: z.number(),
    manualPrice: z.number().optional(),
    basePrice: z.number(),
    currency: idSchema,
    discountAmount: z.number().optional(),
    discountPercent: z.number().optional(),
  })),
})

export type CreateOrderRequest = z.input<typeof createOrderSchema>

export const editOrderSchema = z.object({
  id: idSchema,
  warehouse: idSchema,
  deliveryService: idSchema,
  orderSource: idSchema,
  orderStatus: idSchema,
  orderPayments: z.array(z.object({
    id: z.string().optional(),
    amount: z.number(),
    currency: idSchema,
    cashregister: idSchema,
    cashregisterAccount: idSchema,
    paymentDate: z.string().optional(),
    comment: z.string().optional(),
  }).optional()),
  client: idSchemaOptional,
  comment: z.string().optional(),
  delivery: orderDeliveryFieldSchema,
  files: z.array(orderFileInputSchema).optional().default([]),
  uploadedFilesIds: uploadedFilesIdsSchema,
  items: z.array(z.object({
    id: z.string().optional(),
    product: idSchema,
    quantity: z.number(),
    price: z.number(),
    manualPrice: z.number().optional(),
    basePrice: z.number(),
    currency: idSchema,
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
    productPropertiesGroup: z.object({
      id: idSchema,
      names: languageStringSchema.optional(),
    }).optional(),
    productProperties: z.array(z.object({
      id: idSchema,
      names: languageStringSchema.optional(),
      options: z.array(z.object({
        id: idSchema,
        names: languageStringSchema,
      })).optional().default([]),
      value: z.unknown(),
      data: z.object({
        type: z.string().optional(),
        names: languageStringSchema.optional(),
        showInTable: z.boolean().optional(),
        isRequired: z.boolean().optional(),
        symbols: languageStringSchema.optional(),
      }).optional(),
    })),
    currency: idSchema,
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

export const createOrderShipmentSchema = z.object({
  id: idSchema,
  delivery: orderDeliverySchema.optional(),
})
export type CreateOrderShipmentRequest = z.input<typeof createOrderShipmentSchema>

export const printOrderShipmentLabelSchema = z.object({
  id: idSchema,
})
export type PrintOrderShipmentLabelRequest = z.input<typeof printOrderShipmentLabelSchema>

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

export const createOrderShipmentResponseSchema = responseItemSchema(orderDeliverySchema)
export type CreateOrderShipmentResponse = z.infer<typeof createOrderShipmentResponseSchema>

export const getOrderDetailsResponseSchema = responseSchema.extend({
  data: z.object({
    order: orderDTOPopulatedSchema,
    items: z.array(orderItemDTOPopulatedSchema),
    payments: z.array(orderPaymentDTOPopulatedSchema),
  }),
})
export type GetOrderDetailsResponse = z.infer<typeof getOrderDetailsResponseSchema>

export const syncOrderShipmentsSchema = z.object({
  force: z.boolean().optional().default(false),
})
export type SyncOrderShipmentsRequest = z.input<typeof syncOrderShipmentsSchema>

export const syncOrderShipmentsResponseSchema = responseSchema.extend({
  data: z.object({
    checked: z.number(),
    updated: z.number(),
    statusChanged: z.number(),
  }),
})
export type SyncOrderShipmentsResponse = z.infer<typeof syncOrderShipmentsResponseSchema>
