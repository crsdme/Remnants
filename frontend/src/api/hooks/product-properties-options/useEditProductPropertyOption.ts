import type { editProductPropertyOptionParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { editProductPropertyOption } from '@/api/requests'

export function useEditProductPropertyOption(settings?: MutationSettings<editProductPropertyOptionParams, typeof editProductPropertyOption>) {
  return useMutation({
    mutationFn: (params: editProductPropertyOptionParams) => editProductPropertyOption(params),
    ...settings?.options,
  })
}
