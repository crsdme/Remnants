import type { removeOrdersParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeOrder } from '@/api/requests'

export function useOrderRemove(settings?: MutationSettings<removeOrdersParams, typeof removeOrder>) {
  return useMutation({
    mutationFn: removeOrder,
    ...settings?.options,
  })
}
