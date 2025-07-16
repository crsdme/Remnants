import type { editDeliveryStatusesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editDeliveryStatus } from '@/api/requests'

export function useDeliveryStatusEdit(settings?: MutationSettings<editDeliveryStatusesParams, typeof editDeliveryStatus>) {
  return useMutation({
    mutationFn: editDeliveryStatus,
    ...settings?.options,
  })
}
