import type {
  DeliveryServiceDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import type { deliveryServiceDBSchema } from '../schemas'
import {
  createDeliveryServiceSchema,
  editDeliveryServiceSchema,
  getDeliveryServicesSchema,
  removeDeliveryServicesSchema,
} from '@remnant/shared'

export type DeliveryServiceDB = z.infer<typeof deliveryServiceDBSchema>

export type GetDeliveryServicesPayload = z.output<typeof getDeliveryServicesSchema>
export function parseGetDeliveryServices(x: unknown): GetDeliveryServicesPayload {
  return getDeliveryServicesSchema.parse(x)
}

export type CreateDeliveryServicesPayload = z.output<typeof createDeliveryServiceSchema>
export function parseCreateDeliveryServices(x: unknown): CreateDeliveryServicesPayload {
  return createDeliveryServiceSchema.parse(x)
}

export type EditDeliveryServicesPayload = z.output<typeof editDeliveryServiceSchema>
export function parseEditDeliveryServices(x: unknown): EditDeliveryServicesPayload {
  return editDeliveryServiceSchema.parse(x)
}

export type RemoveDeliveryServicesPayload = z.output<typeof removeDeliveryServicesSchema>
export function parseRemoveDeliveryServices(x: unknown): RemoveDeliveryServicesPayload {
  return removeDeliveryServicesSchema.parse(x)
}

export type GetDeliveryServicesRepoPayload = GetDeliveryServicesPayload
export interface GetDeliveryServicesRepoResult { items: DeliveryServiceDTO[], total: number, page: number, pageSize: number }

export type CreateDeliveryServicesRepoPayload = CreateDeliveryServicesPayload

export type EditDeliveryServicesRepoPayload = EditDeliveryServicesPayload
