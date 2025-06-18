import type { removeProductPropertiesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeProductProperties } from '@/api/requests'

export function useProductPropertyRemove(settings?: MutationSettings<removeProductPropertiesParams, typeof removeProductProperties>) {
  return useMutation({
    mutationFn: removeProductProperties,
    ...settings?.options,
  })
}
