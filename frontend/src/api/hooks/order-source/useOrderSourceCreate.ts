import type { createOrderSourcesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createOrderSource } from '@/api/requests'

export function useOrderSourceCreate(settings?: MutationSettings<createOrderSourcesParams, typeof createOrderSource>) {
  return useMutation({
    mutationFn: createOrderSource,
    ...settings?.options,
  })
}
