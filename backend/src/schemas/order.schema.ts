import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { dateRangeSchema, idSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

export const getOrdersSchema = z.object({
  filters: z.object({
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    color: z.string().optional(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    orderStatus: z.string().optional(),
  }).optional().default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    color: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
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
  client: z.string(),
  comment: z.string().optional(),
  items: z.array(z.object({
    product: z.string(),
    quantity: z.number(),
    price: z.number(),
    currency: z.string(),
  })),
})

export const editOrderSchema = z.object({
  id: idSchema,
  warehouse: z.string(),
  deliveryService: z.string(),
  orderSource: z.string(),
  orderStatus: z.string(),
  orderPayments: z.string(),
  client: z.string(),
  comment: z.string().optional(),
  items: z.array(z.object({
    product: z.string(),
    quantity: z.number(),
    price: z.number(),
    currency: z.string(),
  })),
})

export const removeOrdersSchema = z.object({
  ids: z.array(idSchema).min(1),
})
