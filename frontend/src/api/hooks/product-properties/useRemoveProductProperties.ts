import type { removeProductPropertiesParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { removeProductProperties } from '@/api/requests'

export function useRemoveProductProperties(settings?: MutationSettings<removeProductPropertiesParams, typeof removeProductProperties>) {
  return useMutation({
    mutationFn: (params: removeProductPropertiesParams) => removeProductProperties(params),
    ...settings?.options,
  })
}
