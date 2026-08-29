import type { CreateOrderShipmentRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createOrderShipment } from '@/api/requests'

export function useOrderShipmentCreate(settings?: MutationSettings<CreateOrderShipmentRequest>) {
  return useMutation({
    mutationFn: createOrderShipment,
    ...settings?.options,
  })
}
