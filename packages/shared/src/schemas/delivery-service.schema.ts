import { z } from 'zod'
import { dateRangeSchema, idSchema, languageStringSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'

export const deliveryServiceSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  color: z.string().optional(),
  type: z.enum(['novaposhta', 'selfpickup']),
  active: z.boolean().optional().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type DeliveryServiceDTO = z.output<typeof deliveryServiceSchema>

export const getDeliveryServicesSchema = z.object({
  filters: z.object({
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    color: z.string().optional(),
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
  type: z.enum(['novaposhta', 'selfpickup']),
})

export type CreateDeliveryServiceRequest = z.input<typeof createDeliveryServiceSchema>

export const editDeliveryServiceSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  priority: z.number().optional().default(0),
  type: z.enum(['novaposhta', 'selfpickup']),
  color: z.string().optional(),
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
