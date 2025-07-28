import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { dateRangeSchema, idSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

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
    amount: sorterParamsSchema.optional(),
    currency: sorterParamsSchema.optional(),
    paymentStatus: sorterParamsSchema.optional(),
    paymentDate: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

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

export const removeOrderPaymentsSchema = z.object({
  ids: z.array(idSchema).min(1),
})
