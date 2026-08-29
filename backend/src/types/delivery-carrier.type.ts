import type { z } from 'zod'
import {
  getDeliveryCapabilitiesSchema,
  getDeliveryLocationsSchema,
  lookupDeliveryShipmentSchema,
} from '@remnant/shared'

export type GetDeliveryCapabilitiesPayload = z.output<typeof getDeliveryCapabilitiesSchema>
export function parseGetDeliveryCapabilities(x: unknown): GetDeliveryCapabilitiesPayload {
  return getDeliveryCapabilitiesSchema.parse(x)
}

export type GetDeliveryLocationsPayload = z.output<typeof getDeliveryLocationsSchema>
export function parseGetDeliveryLocations(x: unknown): GetDeliveryLocationsPayload {
  return getDeliveryLocationsSchema.parse(x)
}

export type LookupDeliveryShipmentPayload = z.output<typeof lookupDeliveryShipmentSchema>
export function parseLookupDeliveryShipment(x: unknown): LookupDeliveryShipmentPayload {
  return lookupDeliveryShipmentSchema.parse(x)
}
