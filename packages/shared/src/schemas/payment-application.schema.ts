import { z } from 'zod'
import {
  idSchema,
  idSchemaOptional,
  languageStringSchema,
  paginationSchema,
  responseListSchema,
  sorterParamsSchema,
} from './common'

export const paymentApplicationPartyTypeSchema = z.enum(['client', 'supplier'])
export type PaymentApplicationPartyType = z.output<typeof paymentApplicationPartyTypeSchema>

export const paymentApplicationDocumentTypeSchema = z.enum(['order', 'procurement'])
export type PaymentApplicationDocumentType = z.output<typeof paymentApplicationDocumentTypeSchema>

export const paymentApplicationSchema = z.object({
  id: idSchema,
  seq: z.number().optional().default(0),
  partyType: paymentApplicationPartyTypeSchema,
  partyId: idSchema,
  documentType: paymentApplicationDocumentTypeSchema,
  documentId: idSchema,
  moneyTransactionId: idSchema,
  amount: z.number(),
  currency: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: z.number(),
  }),
  comment: z.string().optional(),
  cancelled: z.boolean(),
  cancelledBy: idSchemaOptional,
  cancelledAt: z.coerce.date().nullable().optional(),
  createdBy: idSchemaOptional,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type PaymentApplicationDTO = z.output<typeof paymentApplicationSchema>

export const getPaymentApplicationsSchema = z.object({
  filters: z.object({
    partyType: paymentApplicationPartyTypeSchema.optional(),
    partyId: idSchemaOptional,
    documentType: paymentApplicationDocumentTypeSchema.optional(),
    documentId: idSchemaOptional,
    moneyTransactionId: idSchemaOptional,
  }).optional().default({}),
  sorters: z.object({
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})
export type GetPaymentApplicationsRequest = z.input<typeof getPaymentApplicationsSchema>

export const getPaymentApplicationsResponseSchema = responseListSchema(paymentApplicationSchema)
export type GetPaymentApplicationsResponse = z.output<typeof getPaymentApplicationsResponseSchema>
