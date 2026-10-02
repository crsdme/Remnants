import { z } from 'zod'
import { dateRangeSchema, idSchema, idSchemaOptional, languageStringSchema, numberFromStringSchema, paginationSchema, responseListSchema, sorterParamsSchema } from './common'

/** Order payment line for UI — backed by payment-application + money-transaction, not order-payments collection. */
export const orderPaymentSchema = z.object({
  id: idSchema,
  order: idSchema,
  cashregister: z.object({
    id: idSchema,
    names: languageStringSchema,
  }),
  cashregisterAccount: z.object({
    id: idSchema,
    names: languageStringSchema,
  }),
  amount: numberFromStringSchema,
  currency: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: z.number(),
  }),
  paymentDate: z.coerce.date(),
  transaction: idSchemaOptional,
  comment: z.string().trim().optional(),
  createdBy: idSchemaOptional,
  removedBy: idSchemaOptional,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type OrderPaymentDTO = z.output<typeof orderPaymentSchema>

export const orderPaymentDTOPopulatedSchema = orderPaymentSchema
export type OrderPaymentDTOPopulated = z.output<typeof orderPaymentDTOPopulatedSchema>

export const getOrderPaymentsSchema = z.object({
  filters: z.object({
    order: z.array(idSchema).optional().default([]),
    paymentDate: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetOrderPaymentsRequest = z.input<typeof getOrderPaymentsSchema>

export const getOrderPaymentsResponseSchema = responseListSchema(orderPaymentDTOPopulatedSchema)
export type GetOrderPaymentsResponse = z.output<typeof getOrderPaymentsResponseSchema>
