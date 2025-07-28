import type { removeDeliveryServicesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeDeliveryService } from '@/api/requests'

export function useDeliveryServiceRemove(settings?: MutationSettings<removeDeliveryServicesParams, typeof removeDeliveryService>) {
  return useMutation({
    mutationFn: removeDeliveryService,
    ...settings?.options,
  })
}
