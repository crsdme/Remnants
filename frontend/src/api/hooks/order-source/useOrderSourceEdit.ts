import type { EditOrderSourceRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editOrderSource } from '@/api/requests'

export function useOrderSourceEdit(settings?: MutationSettings<EditOrderSourceRequest>) {
  return useMutation({
    mutationFn: editOrderSource,
    ...settings?.options,
  })
}
