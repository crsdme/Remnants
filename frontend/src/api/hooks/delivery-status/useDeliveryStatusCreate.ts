import type { createDeliveryStatusesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createDeliveryStatus } from '@/api/requests'

export function useDeliveryStatusCreate(settings?: MutationSettings<createDeliveryStatusesParams, typeof createDeliveryStatus>) {
  return useMutation({
    mutationFn: createDeliveryStatus,
    ...settings?.options,
  })
}
