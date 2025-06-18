import type { editProductPropertyParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editProductProperty } from '@/api/requests'

export function useProductPropertyEdit(settings?: MutationSettings<editProductPropertyParams, typeof editProductProperty>) {
  return useMutation({
    mutationFn: editProductProperty,
    ...settings?.options,
  })
}
