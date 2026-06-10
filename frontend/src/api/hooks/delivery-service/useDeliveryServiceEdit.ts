import type { EditDeliveryServiceRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editDeliveryService } from '@/api/requests'

export function useDeliveryServiceEdit(settings?: MutationSettings<EditDeliveryServiceRequest>) {
  return useMutation({
    mutationFn: editDeliveryService,
    ...settings?.options,
  })
}
