import type { removeClientsParams } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeClient } from '@/api/requests'

export function useClientRemove(settings?: MutationSettings<removeClientsParams>) {
  return useMutation({
    mutationFn: removeClient,
    ...settings?.options,
  })
}
