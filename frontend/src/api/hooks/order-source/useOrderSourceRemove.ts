import type { removeOrderSourcesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeOrderSource } from '@/api/requests'

export function useOrderSourceRemove(settings?: MutationSettings<removeOrderSourcesParams, typeof removeOrderSource>) {
  return useMutation({
    mutationFn: removeOrderSource,
    ...settings?.options,
  })
}
