import type { removeOrderStatusesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeOrderStatus } from '@/api/requests'

export function useOrderStatusRemove(settings?: MutationSettings<removeOrderStatusesParams, typeof removeOrderStatus>) {
  return useMutation({
    mutationFn: removeOrderStatus,
    ...settings?.options,
  })
}
