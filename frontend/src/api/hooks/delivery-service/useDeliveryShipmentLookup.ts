import type { LookupDeliveryShipmentRequest } from '@remnant/shared'
import { useMutation } from '@tanstack/react-query'
import { lookupDeliveryShipment } from '@/api/requests'

export function useDeliveryShipmentLookup(settings?: MutationSettings<LookupDeliveryShipmentRequest>) {
  return useMutation({
    mutationFn: lookupDeliveryShipment,
    ...settings?.options,
  })
}
