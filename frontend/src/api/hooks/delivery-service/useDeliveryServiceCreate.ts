import type { createDeliveryServicesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createDeliveryService } from '@/api/requests'

export function useDeliveryServiceCreate(settings?: MutationSettings<createDeliveryServicesParams, typeof createDeliveryService>) {
  return useMutation({
    mutationFn: createDeliveryService,
    ...settings?.options,
  })
}
