import type { editProductPropertyParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { editProductProperty } from '@/api/requests'

export function useEditProductProperty(settings?: MutationSettings<editProductPropertyParams, typeof editProductProperty>) {
  return useMutation({
    mutationFn: (params: editProductPropertyParams) => editProductProperty(params),
    ...settings?.options,
  })
}
