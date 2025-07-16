import type { editOrderSourcesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editOrderSource } from '@/api/requests'

export function useOrderSourceEdit(settings?: MutationSettings<editOrderSourcesParams, typeof editOrderSource>) {
  return useMutation({
    mutationFn: editOrderSource,
    ...settings?.options,
  })
}
