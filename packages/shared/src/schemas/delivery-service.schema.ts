import { z } from 'zod'
import {
  dateRangeSchema,
  idSchema,
  languageStringSchema,
  numberFromStringSchema,
  paginationSchema,
  responseItemSchema,
  responseListSchema,
  responseSchema,
  sorterParamsSchema,
} from './common'
import { deliveryCarrierTypeSchema, deliveryLocationRefSchema } from './delivery-carrier.schema'

/** Placeholder returned/accepted so clients never see or overwrite the real key unintentionally. */
export const DELIVERY_SERVICE_API_KEY_MASK = '********'

export const novaPoshtaCredentialsSchema = z.object({
  type: z.literal('novaposhta'),
  apiKey: z.string().trim().min(1),
  phone: z.string().trim().min(10),
  sender: z.object({
    city: deliveryLocationRefSchema,
    office: deliveryLocationRefSchema,
  }),
})
export type NovaPoshtaCredentials = z.output<typeof novaPoshtaCredentialsSchema>

export const selfPickupCredentialsSchema = z.object({
  type: z.literal('selfpickup'),
})

export const deliveryServiceCredentialsSchema = z.discriminatedUnion('type', [
  novaPoshtaCredentialsSchema,
  selfPickupCredentialsSchema,
])
export type DeliveryServiceCredentials = z.output<typeof deliveryServiceCredentialsSchema>

/** Credentials as returned to clients — apiKey is masked when present. */
export const deliveryServiceCredentialsDTOSchema = z.discriminatedUnion('type', [
  novaPoshtaCredentialsSchema.extend({
    apiKey: z.string(),
    hasApiKey: z.boolean().optional().default(true),
  }),
  selfPickupCredentialsSchema,
])

export const deliveryServiceSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  color: z.string().optional(),
  type: deliveryCarrierTypeSchema,
  active: z.boolean().optional().default(true),
  credentials: deliveryServiceCredentialsDTOSchema.optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type DeliveryServiceDTO = z.output<typeof deliveryServiceSchema>

export const getDeliveryServicesSchema = z.object({
  filters: z.object({
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    color: z.string().optional(),
    type: deliveryCarrierTypeSchema.optional(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
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

export type GetDeliveryServicesRequest = z.input<typeof getDeliveryServicesSchema>

export const createDeliveryServiceSchema = z.object({
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  color: z.string().optional(),
  type: deliveryCarrierTypeSchema,
  active: z.boolean().optional().default(true),
  credentials: deliveryServiceCredentialsSchema,
}).superRefine((data, ctx) => {
  if (data.credentials.type !== data.type) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'credentials.type must match type',
      path: ['credentials', 'type'],
    })
  }
})

export type CreateDeliveryServiceRequest = z.input<typeof createDeliveryServiceSchema>

export const editDeliveryServiceSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  type: deliveryCarrierTypeSchema,
  color: z.string().optional(),
  active: z.boolean().optional().default(true),
  credentials: deliveryServiceCredentialsSchema,
}).superRefine((data, ctx) => {
  if (data.credentials.type !== data.type) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'credentials.type must match type',
      path: ['credentials', 'type'],
    })
  }
})

export type EditDeliveryServiceRequest = z.input<typeof editDeliveryServiceSchema>

export const removeDeliveryServicesSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveDeliveryServicesRequest = z.input<typeof removeDeliveryServicesSchema>

export const getDeliveryServicesResponseSchema = responseListSchema(deliveryServiceSchema)
export type GetDeliveryServicesResponse = z.output<typeof getDeliveryServicesResponseSchema>

export const createDeliveryServiceResponseSchema = responseItemSchema(deliveryServiceSchema)
export type CreateDeliveryServiceResponse = z.output<typeof createDeliveryServiceResponseSchema>

export const editDeliveryServiceResponseSchema = responseItemSchema(deliveryServiceSchema)
export type EditDeliveryServiceResponse = z.output<typeof editDeliveryServiceResponseSchema>

export const removeDeliveryServicesResponseSchema = responseSchema
export type RemoveDeliveryServicesResponse = z.output<typeof removeDeliveryServicesResponseSchema>
