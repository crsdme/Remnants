import { z } from 'zod'

export const createOrderRepoSchema = z.object({
  _id: z.string(),
  warehouse: z.string(),
  deliveryService: z.string(),
  orderSource: z.string(),
  orderStatus: z.string(),
  orderPayments: z.array(z.string()),
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
  orderPaymentStatus: z.enum(['paid', 'unpaid', 'partially_paid', 'overpaid']),
})

export const editOrderRepoSchema = z.object({
  warehouse: z.string(),
  deliveryService: z.string(),
  orderSource: z.string(),
  orderStatus: z.string(),
  orderPayments: z.array(z.string()),
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
  orderPaymentStatus: z.enum(['paid', 'unpaid', 'partially_paid', 'overpaid']),
})

export const printInvoiceOrderRepoSchema = z.object({
  seq: z.number(),
  language: z.string(),
})

export const editOrderItemRepoSchema = z.object({
  id: z.string(),
  product: z.string().optional(),
  quantity: z.number().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  manualPrice: z.number().optional(),
  basePrice: z.number().optional(),
  removed: z.boolean().optional(),
  removedBy: z.string().optional(),
  discountAmount: z.number().optional(),
  discountPercent: z.number().optional(),
})
