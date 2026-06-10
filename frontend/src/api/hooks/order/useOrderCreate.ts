import type { CreateOrderRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createOrder } from '@/api/requests'

export function useOrderCreate(settings?: MutationSettings<CreateOrderRequest>) {
  return useMutation({
    mutationFn: createOrder,
    ...settings?.options,
  })
}
