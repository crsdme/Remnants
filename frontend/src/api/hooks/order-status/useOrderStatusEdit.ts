import type { editOrderStatusesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editOrderStatus } from '@/api/requests'

export function useOrderStatusEdit(settings?: MutationSettings<editOrderStatusesParams, typeof editOrderStatus>) {
  return useMutation({
    mutationFn: editOrderStatus,
    ...settings?.options,
  })
}
