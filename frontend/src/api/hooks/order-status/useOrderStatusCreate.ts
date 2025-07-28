import type { createOrderStatusesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createOrderStatus } from '@/api/requests'

export function useOrderStatusCreate(settings?: MutationSettings<createOrderStatusesParams, typeof createOrderStatus>) {
  return useMutation({
    mutationFn: createOrderStatus,
    ...settings?.options,
  })
}
