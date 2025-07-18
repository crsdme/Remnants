import type { removeClientsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeClient } from '@/api/requests'

export function useClientRemove(settings?: MutationSettings<removeClientsParams, typeof removeClient>) {
  return useMutation({
    mutationFn: removeClient,
    ...settings?.options,
  })
}
