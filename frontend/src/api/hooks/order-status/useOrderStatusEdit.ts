import type { EditOrderStatusRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editOrderStatus } from '@/api/requests'

export function useOrderStatusEdit(settings?: MutationSettings<EditOrderStatusRequest>) {
  return useMutation({
    mutationFn: editOrderStatus,
    ...settings?.options,
  })
}
