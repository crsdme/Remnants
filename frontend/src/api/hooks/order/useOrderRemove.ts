import type { RemoveOrdersRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeOrder } from '@/api/requests'

export function useOrderRemove(settings?: MutationSettings<RemoveOrdersRequest>) {
  return useMutation({
    mutationFn: removeOrder,
    ...settings?.options,
  })
}
