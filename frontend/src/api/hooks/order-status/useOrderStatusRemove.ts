import type { RemoveOrderStatusesRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeOrderStatus } from '@/api/requests'

export function useOrderStatusRemove(settings?: MutationSettings<RemoveOrderStatusesRequest>) {
  return useMutation({
    mutationFn: removeOrderStatus,
    ...settings?.options,
  })
}
