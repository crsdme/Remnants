import { z } from 'zod'
import { dateRangeSchema, idSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

export const getOrderPaymentsSchema = z.object({
  filters: z.object({
    order: z.string().trim().optional(),
    cashregister: z.string().trim().optional(),
    cashregisterAccount: z.string().trim().optional(),
    amount: numberFromStringSchema.optional(),
    currency: z.string().trim().optional(),
    paymentStatus: z.string().trim().optional(),
    paymentDate: dateRangeSchema.optional(),
    transaction: z.string().trim().optional(),
    createdBy: z.string().trim().optional(),
    removedBy: z.string().trim().optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetOrderPaymentsRequest = z.input<typeof getOrderPaymentsSchema>

export const createOrderPaymentSchema = z.object({
  order: z.string(),
  cashregister: z.string(),
  cashregisterAccount: z.string(),
  amount: numberFromStringSchema,
  currency: z.string(),
  paymentStatus: z.string(),
  paymentDate: z.date(),
  comment: z.string().optional(),
})

export type CreateOrderPaymentRequest = z.input<typeof createOrderPaymentSchema>

export const editOrderPaymentSchema = z.object({
  id: idSchema,
  order: z.string(),
  cashregister: z.string(),
  cashregisterAccount: z.string(),
  amount: numberFromStringSchema,
  currency: z.string(),
  paymentStatus: z.string(),
  paymentDate: z.date(),
  comment: z.string().optional(),
})

export type EditOrderPaymentRequest = z.input<typeof editOrderPaymentSchema>

export const removeOrderPaymentsSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveOrderPaymentsRequest = z.input<typeof removeOrderPaymentsSchema>

export const createOrderItemSchema = z.object({
  order: idSchema,
  product: idSchema,
  quantity: numberFromStringSchema,
  manualPrice: numberFromStringSchema.optional(),
  basePrice: numberFromStringSchema,
  price: numberFromStringSchema,
  purchasePrice: numberFromStringSchema,
  purchaseCurrency: idSchema,
  profit: numberFromStringSchema,
  currency: idSchema,
  discountAmount: numberFromStringSchema.optional(),
  discountPercent: numberFromStringSchema.optional(),
  exchangeRate: numberFromStringSchema.optional(),
  createdBy: idSchema,
})
