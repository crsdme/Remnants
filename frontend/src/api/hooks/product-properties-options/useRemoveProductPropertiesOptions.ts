import type { removeProductPropertyOptionParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { removeProductPropertyOption } from '@/api/requests'

export function useRemoveProductPropertyOptions(settings?: MutationSettings<removeProductPropertyOptionParams, typeof removeProductPropertyOption>) {
  return useMutation({
    mutationFn: (params: removeProductPropertyOptionParams) => removeProductPropertyOption(params),
    ...settings?.options,
  })
}
