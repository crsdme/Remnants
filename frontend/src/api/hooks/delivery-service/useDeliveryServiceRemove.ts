import type { RemoveDeliveryServicesRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeDeliveryService } from '@/api/requests'

export function useDeliveryServiceRemove(settings?: MutationSettings<RemoveDeliveryServicesRequest>) {
  return useMutation({
    mutationFn: removeDeliveryService,
    ...settings?.options,
  })
}
