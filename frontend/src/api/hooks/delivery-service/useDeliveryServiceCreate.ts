import type { CreateDeliveryServiceRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createDeliveryService } from '@/api/requests'

export function useDeliveryServiceCreate(settings?: MutationSettings<CreateDeliveryServiceRequest>) {
  return useMutation({
    mutationFn: createDeliveryService,
    ...settings?.options,
  })
}
