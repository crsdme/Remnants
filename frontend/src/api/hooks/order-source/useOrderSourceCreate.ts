import type { CreateOrderSourceRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createOrderSource } from '@/api/requests'

export function useOrderSourceCreate(settings?: MutationSettings<CreateOrderSourceRequest>) {
  return useMutation({
    mutationFn: createOrderSource,
    ...settings?.options,
  })
}
