import type { EditOrderRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editOrder } from '@/api/requests'

export function useOrderEdit(settings?: MutationSettings<EditOrderRequest>) {
  return useMutation({
    mutationFn: editOrder,
    ...settings?.options,
  })
}
