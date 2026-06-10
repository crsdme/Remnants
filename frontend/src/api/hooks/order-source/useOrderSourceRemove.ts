import type { RemoveOrderSourcesRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeOrderSource } from '@/api/requests'

export function useOrderSourceRemove(settings?: MutationSettings<RemoveOrderSourcesRequest>) {
  return useMutation({
    mutationFn: removeOrderSource,
    ...settings?.options,
  })
}
