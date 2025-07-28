import type { createClientParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createClient } from '@/api/requests'

export function useClientCreate(settings?: MutationSettings<createClientParams, typeof createClient>) {
  return useMutation({
    mutationFn: createClient,
    ...settings?.options,
  })
}
