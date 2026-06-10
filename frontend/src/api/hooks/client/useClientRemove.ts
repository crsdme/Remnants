import type { RemoveClientsRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeClient } from '@/api/requests'

export function useClientRemove(settings?: MutationSettings<RemoveClientsRequest>) {
  return useMutation({
    mutationFn: removeClient,
    ...settings?.options,
  })
}
