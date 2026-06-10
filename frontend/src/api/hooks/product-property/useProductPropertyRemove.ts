import type { RemoveProductPropertyRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeProductProperties } from '@/api/requests'

export function useProductPropertyRemove(settings?: MutationSettings<RemoveProductPropertyRequest>) {
  return useMutation({
    mutationFn: removeProductProperties,
    ...settings?.options,
  })
}
