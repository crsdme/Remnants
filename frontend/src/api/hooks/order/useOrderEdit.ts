import type { editOrderParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editOrder } from '@/api/requests'

export function useOrderEdit(settings?: MutationSettings<editOrderParams, typeof editOrder>) {
  return useMutation({
    mutationFn: editOrder,
    ...settings?.options,
  })
}
