import type { editProductPropertyOptionParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editProductPropertyOption } from '@/api/requests'

export function useProductPropertyOptionEdit(settings?: MutationSettings<editProductPropertyOptionParams, typeof editProductPropertyOption>) {
  return useMutation({
    mutationFn: editProductPropertyOption,
    ...settings?.options,
  })
}
