import type { editDeliveryServicesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editDeliveryService } from '@/api/requests'

export function useDeliveryServiceEdit(settings?: MutationSettings<editDeliveryServicesParams, typeof editDeliveryService>) {
  return useMutation({
    mutationFn: editDeliveryService,
    ...settings?.options,
  })
}
