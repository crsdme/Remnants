import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { dateRangeSchema, idSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getOrdersSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    seq: z.string().trim().optional(),
    warehouse: z.string().trim().optional(),
    deliveryService: z.string().trim().optional(),
    orderSource: z.string().trim().optional(),
    orderStatus: z.string().trim().optional(),
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
    currency: z.string(),
    discountAmount: z.number().optional(),
    discountPercent: z.number().optional(),
  })),
})

export const editOrderSchema = z.object({
  id: idSchema,
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
    currency: z.string(),
    discountAmount: z.number().optional(),
    discountPercent: z.number().optional(),
  })),
})

export const removeOrdersSchema = z.object({
  ids: z.array(idSchema).min(1),
})
