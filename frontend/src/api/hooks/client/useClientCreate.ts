import type { createClientParams } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createClient } from '@/api/requests'

export function useClientCreate(settings?: MutationSettings<createClientParams>) {
  return useMutation({
    mutationFn: createClient,
    ...settings?.options,
  })
}
