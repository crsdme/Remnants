import type { createOrderParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createOrder } from '@/api/requests'

export function useOrderCreate(settings?: MutationSettings<createOrderParams, typeof createOrder>) {
  return useMutation({
    mutationFn: createOrder,
    ...settings?.options,
  })
}
