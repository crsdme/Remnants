import type { CreateOrderStatusRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createOrderStatus } from '@/api/requests'

export function useOrderStatusCreate(settings?: MutationSettings<CreateOrderStatusRequest>) {
  return useMutation({
    mutationFn: createOrderStatus,
    ...settings?.options,
  })
}
