import type { removeDeliveryStatusesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeDeliveryStatus } from '@/api/requests'

export function useDeliveryStatusRemove(settings?: MutationSettings<removeDeliveryStatusesParams, typeof removeDeliveryStatus>) {
  return useMutation({
    mutationFn: removeDeliveryStatus,
    ...settings?.options,
  })
}
